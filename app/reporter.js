const { InfluxDB, FieldType } = require('influx');
const { Client } = require('tplink-smarthome-api');

const host = process.env.HOSTNAME;
const db = process.env.INFLUX_DB;

const client = new Client();
const influx = new InfluxDB({
    host: process.env.INFLUX_HOST,
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
    constructor() {
        this.timer = process.env.TIMER || 5000;
        this.device = null;
    }

    export(res) {
        influx.writePoints([
            {
                measurement: 'power_consumption',
                tags: { host: host },
                fields: {
                    current_ma: res.current_ma,
                    voltage_mv: res.voltage_mv,
                    total_wh: res.total_wh,
                    power_mw: res.power_mw
                },
            }
        ])
            .catch(err => {
                console.log(err.message)
            })
    }
    getDevice() {
        return client.getDevice({ host: process.env.DEVICE_IP_ADDR })
            .then(device => {
                this.device = device;
                return device;
            })
    }

    query() {
        return this.device.emeter.getRealtime()
    }

    format(raw) {
        delete raw.err_code;
        return raw
    }

    log(res) {
        if (process.env.DEBUG) console.log(res);
        return res
    }

    async checkDatabase() {
        try {
            const names = await influx.getDatabaseNames();
            if (!names.includes(db)) {
                return influx.createDatabase(db);
            }
        } catch (err) {
            console.error(`Error creating Influx database!`,);
        }
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
                        .catch(err => console.error(err.message))
                }, this.timer)
            });
    }
}

module.exports = Reporter;