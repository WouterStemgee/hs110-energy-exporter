# HS110 Energy Monitor - InfluxDB Exporter
> A TP-Link HS110 Smart Plug Exporter for InfluxDB

## Install & Usage
```bash
git clone https://gitlab.wouterstemgee.be/wouterstemgee/hs110-influx.git
npm install

TIMER=1000 \
DEVICE_IP_ADDR=10.20.0.110 \
DEBUG=true \
INFLUX_HOST=localhost \
HOSTNAME=hs110 \
npm start
```

## Docker usage
```bash
docker run \
  -e TIMER=1000 \
  -e DEVICE_IP_ADDR=10.20.0.110 \
  -e DEBUG=true \
  -e INFLUX_HOST=localhost \
  -e INFLUX_DB=hs110_db \
  -e HOSTNAME=hs110 \
  -d wouterstemgee/hs110-influx

```

## Export JSON Format
`power_consumption` measurement point:
```json
{
    voltage_vm: 0,
    current_ma: 0,
    power_mw: 0,
    total_wh: 0
}
```