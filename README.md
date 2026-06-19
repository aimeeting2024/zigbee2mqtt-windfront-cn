# Zigbee2MQTT WindFront

[![Version](https://img.shields.io/npm/v/zigbee2mqtt-windfront.svg)](https://npmjs.org/package/zigbee2mqtt-windfront)
[![CI](https://github.com/Nerivec/zigbee2mqtt-windfront/actions/workflows/ci.yml/badge.svg)](https://github.com/Nerivec/zigbee2mqtt-windfront/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Nerivec/zigbee2mqtt-windfront/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/Nerivec/zigbee2mqtt-windfront/actions/workflows/github-code-scanning/codeql)

A frontend UI for [Zigbee2MQTT](https://github.com/Koenkk/zigbee2mqtt) using [tailwindcss](https://tailwindcss.com/) & [daisyui](https://daisyui.com).

https://github.com/Nerivec/zigbee2mqtt-windfront/wiki

> Based on https://github.com/nurikk/zigbee2mqtt-frontend

## China-localized fork notes

This fork keeps the upstream WindFront structure and adds a lightweight mobile operations page at `#/mobile-ops`.

The mobile operations page is designed for field installation and maintenance. It reuses the existing Zigbee2MQTT WebSocket channel and state store, and currently covers:

- gateway/MQTT status overview;
- device search and quick health indicators;
- permit-join toggle for pairing;
- device rename, re-interview, and remove actions;
- recent log inspection on mobile screens.

The Simplified Chinese locale is treated as a maintained translation in this fork, so the language switcher no longer marks `zh-CN` as AI-generated.

### Local development

```sh
npm install
npm start
```

When running against a local Zigbee2MQTT instance, point the frontend to the backend WebSocket endpoint:

```sh
VITE_Z2M_API_URLS=localhost:8080/api VITE_Z2M_API_NAMES=local npm start
```

On Windows PowerShell:

```powershell
$env:VITE_Z2M_API_URLS="localhost:8080/api"; $env:VITE_Z2M_API_NAMES="local"; npm start
```

### Using this fork in a Zigbee2MQTT source build

Zigbee2MQTT loads the frontend package through the `frontend.package` setting. For a source-based image, build this frontend fork first, then make the Zigbee2MQTT source depend on your forked frontend package before building the image.

During local development you can pack this frontend and install it into a sibling Zigbee2MQTT checkout:

```sh
npm run build
npm pack
cd ../zigbee2mqtt
pnpm add ../zigbee2mqtt-windfront/zigbee2mqtt-windfront-*.tgz
pnpm run build
```

On Windows, if `npm pack` fails because the upstream `clean` script uses POSIX `rm`, run `npm run build` first and then create the package without lifecycle scripts:

```powershell
npm run build
npm pack --ignore-scripts
```

For the public fork, replace Zigbee2MQTT's `zigbee2mqtt-windfront` dependency with your GitHub/npm package, then build your own Docker image from the Zigbee2MQTT source checkout.

![device-info](./screenshots/device-info.png)
![device-exposes](./screenshots/device-exposes.png)
![network-map](./screenshots/network-map.png)
![network-data](./screenshots/network-data.png)

### 35 themes offered by the [design library](https://daisyui.com/docs/themes/#list-of-themes)!

![devices-t1](./screenshots/devices-t1.png)
![devices-t2](./screenshots/devices-t2.png)
![devices-t3](./screenshots/devices-t3.png)
![devices-t4](./screenshots/devices-t4.png)

# Contributing

[CONTRIBUTING](./CONTRIBUTING.md)
