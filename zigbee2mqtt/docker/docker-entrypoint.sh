#!/bin/sh
set -e

# Use ZIGBEE2MQTT_DATA env var if set, otherwise default to /app/data
export ZIGBEE2MQTT_DATA="${ZIGBEE2MQTT_DATA:-/app/data}"

if [ ! -f "$ZIGBEE2MQTT_DATA/configuration.yaml" ]; then
    echo "No configuration.yaml found in $ZIGBEE2MQTT_DATA"
    echo "Copying default configuration..."
    mkdir -p "$ZIGBEE2MQTT_DATA"
    cp /app/data/configuration.example.yaml "$ZIGBEE2MQTT_DATA/configuration.yaml"
    echo "Please edit $ZIGBEE2MQTT_DATA/configuration.yaml before starting."
fi

echo "Using Zigbee2MQTT data directory: $ZIGBEE2MQTT_DATA"

exec "$@"
