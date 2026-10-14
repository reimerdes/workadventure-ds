# WorkAdventure Map Start DS-HQ

![map](./map.png)

This is a starter kit to help you build your own map for [WorkAdventure](https://workadventu.re).

To understand how to use this starter kit, follow the tutorial at [https://workadventu.re/map-building](https://workadventu.re/map-building).

## Installation

### Prerequisites

- Install [Node.js](https://nodejs.org/en/) 24 LTS (recommended), including npm.
	The locked dependencies also support Node.js 22.12+ and 20.19+.
- Use Linux or macOS. On Windows, run the project inside WSL and install Node.js
	and `cloudflared` there. The current start scripts are not native PowerShell
	or Command Prompt scripts.
- Install `cloudflared` separately for Cloudflare tunnels; it is not an npm
	dependency and is not installed by `npm ci`.
- Internet access is required for installing dependencies and running a tunnel.

### Install Project Dependencies

Clone or copy the complete project, including the map, assets, scripts and
`package-lock.json`. In a terminal in the project root, run:

```shell
node --version
npm --version
npm ci
```

`npm ci` installs the versions recorded in the lockfile, including development
dependencies such as Vite and Chokidar. Run it on each new system and again after
pulling dependency changes. Do not copy `node_modules` between systems or install
with `--omit=dev`: the build and live mode need development dependencies.
`npm run start:live` does not install dependencies itself.

### Install Cloudflare Tunnel

Follow the official [cloudflared installation instructions](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/).
For Linux/WSL on x86-64, a user-local installation needs no root privileges:

```shell
mkdir -p "$HOME/.local/bin"
curl --fail --location --output "$HOME/.local/bin/cloudflared" \
	https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x "$HOME/.local/bin/cloudflared"
export PATH="$HOME/.local/bin:$PATH"
cloudflared --version
```

Make the `PATH` setting persistent in your shell configuration, such as
`~/.bashrc` or `~/.zshrc`. On ARM64 Linux, use `cloudflared-linux-arm64` instead.
On macOS with Homebrew, run `brew install cloudflared` and then
`cloudflared --version`.

## Daily Live Workflow

Start everything once from the project root:

```shell
npm run start:live
```

The command builds an optimized map, starts a file watcher and a local server on
`http://127.0.0.1:4173`, then creates a Cloudflare Quick Tunnel. No Cloudflare
account, domain, certificate setup or router port forwarding is needed.

Cloudflare prints a URL such as `https://<random-name>.trycloudflare.com`.
Use its map URL `https://<random-name>.trycloudflare.com/map.tmj` in WorkAdventure.
The local root page is not the WorkAdventure game client.

1. Keep the terminal running.
2. Save changes to `map.tmj`, scripts in `src`, assets or files in `public`.
3. Wait for `[watch] Build ready. Reload the browser with F5.` in the terminal.
4. Reload WorkAdventure with F5. No manual build or restart is needed.

Changes made during a build are queued for a subsequent build; builds never run
in parallel. Avoid reloading during a build, while `dist` is being regenerated.
After a failed build, fix the error and save again to retry.

The server and tunnel keep running during rebuilds, so the public URL stays the
same. Stop everything with Ctrl+C; exit code 130 after Ctrl+C is normal. A new
start creates a new Cloudflare hostname, which must also be updated in the
WorkAdventure URL. Anyone with the tunnel URL can access the published files
while the process runs. Quick Tunnels are for development, not permanent hosting.

If port 4173 is already in use, stop the previous server first. If `cloudflared`
is not found, check its installation and `PATH` in the shell starting npm.

## Other Start Commands

```shell
# Build once, then start static server + tunnel together
npm run start:dist

# Optimized build + Cloudflare tunnel (small texture atlases instead of source tilesets)
npm run start:dist:cloudflare

# Alternative live mode using Localtunnel
npm run start:live:localtunnel

# Cloudflare tunnel only, when a server is already running on port 4173
npm run tunnel:cloudflare

# Local optimized build and server without a tunnel
npm run build
npm run serve:dist

# Raw Vite development server without optimized tileset atlases
npm run start
```

The `start:dist` commands build only once. To publish subsequent changes, run
`npm run build` in a second terminal and then reload the browser; the server and
tunnel can keep running. Prefer `start:live` for automatic rebuilds. Raw
`npm run start` serves the original tilesets, which can exceed GPU texture limits
and cause missing tiles; it is not equivalent to the optimized live workflow.

Localtunnel commands do not require `cloudflared`; they use `npx` to download the
Localtunnel CLI when necessary.

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
