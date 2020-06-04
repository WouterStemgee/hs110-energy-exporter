import { InfluxDB, FieldType } from 'influx';
import { hostname } from 'os';

const host = process.env.HOSTNAME || hostname();
const db = process.env.INFLUX_DB || 'hs110_db';

import { Client } from 'tplink-smarthome-api';

const client = new Client();

const influx = new InfluxDB({
    host: process.env.INFLUX_HOST || 'localhost',
    database: db,
    schema: [
        {
            measurement: 'power_consumption',
            fields: {
                current_ma: FieldType.FLOAT,
                voltage_mv: FieldType.FLOAT,
                total_wh: FieldType.FLOAT,
                power_mw: FieldType.FLOAT,
            },
            tags: [
                'host'
            ]
        }
    ]
});

class Reporter {
    export(res) {
        influx.writePoints([
            {
                measurement: 'power_consumption',
                tags: {host: host},
                fields: res,
            }
        ])
    }
    getDevice () {
        return client.getDevice({host: process.env.DEVICE_IP_ADDR})
            .then(device => {
                this.device = device;
                return device;
            })
    }
    constructor() {
        this.timer = process.env.TIMER || 5000;
        this.device = null;
    }

    query() {
        return this.device.emeter.getRealtime()
    }

    format(raw) {
        delete raw.err_code;
        return raw
    }

    log(res) {
        if (!process.env.DEBUG) return res;
        console.log(res);
        return res
    }

    checkDatabase() {
        return influx.getDatabaseNames()
            .then(names => {
                if (!names.includes(db)) {
                    return influx.createDatabase(db);
                }
            })
            .catch(err => {
                console.error(`Error creating Influx database!`);
            })
    }

    run() {
        this.checkDatabase()
            .then(_ => this.getDevice())
            .then(_ => {
                setInterval(_ => {
                    this.query()
                        .then(res => this.format(res))
                        .then(res => this.log(res))
                        .then(res => this.export(res))
                }, this.timer)
            });
    }
}