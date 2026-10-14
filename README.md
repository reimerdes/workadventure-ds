# WorkAdventure Map Start DS-HQ

![map](./map.png)

This is a starter kit to help you build your own map for [WorkAdventure](https://workadventu.re).

To understand how to use this starter kit, follow the tutorial at [https://workadventu.re/map-building](https://workadventu.re/map-building).

## Installation

With npm installed (comes with [node](https://nodejs.org/en/)), run the following commands into a terminal in the root directory of this project:

```shell
npm install
npm run start
```

## Dist And Tunnel Shortcuts

You can now use these shortcuts for WorkAdventure publishing/testing workflows:

Live mode requires [cloudflared](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/) on your `PATH`.
It starts a Cloudflare Quick Tunnel without an account or domain. The printed
`https://<random-name>.trycloudflare.com` URL is public and changes on each start.
Use that hostname with `/map.tmj` in WorkAdventure. Stop the process to close access.

```shell
# Build once, then start static server + tunnel together
npm run start:dist

# Optimized build + Cloudflare tunnel (small texture atlases instead of source tilesets)
npm run start:dist:cloudflare

# Live mode: no rebuild needed after each change (auto update) + Cloudflare tunnel
npm run start:live

# Alternative live mode using Localtunnel
npm run start:live:localtunnel

# Cloudflare tunnel only, when a server is already running on port 4173
npm run tunnel:cloudflare
```

If you use VS Code, open Run and Debug and select:

- WA: Start Dist (Build + Tunnel)
- WA: Start Live (Auto-Update + Tunnel)

## Licenses

This project contains multiple licenses as follows:

* [Code license](./LICENSE.code) *(all files except those for other licenses)*
* [Map license](./LICENSE.map) *(`map.json` and the map visual as well)*
* [Assets license](./LICENSE.assets) *(the files inside the `src/assets/` folder)*

### About third party assets

If you add third party assets in your map, do not forget to:
1. Credit the author and license with the "tilesetCopyright" property present in the properties of each tilesets in the `map.json` file
2. Add the license text in LICENSE.assets
