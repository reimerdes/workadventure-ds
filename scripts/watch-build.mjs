import { spawn } from 'node:child_process';
import chokidar from 'chokidar';

let buildProcess;
let debounceTimer;
let buildPending = false;
let stopping = false;

function runBuild() {
    if (stopping || buildProcess || !buildPending) {
        return;
    }

    buildPending = false;
    console.log('[watch] Building optimized map...');
    buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'inherit',
        detached: true,
    });
    buildProcess.on('error', error => {
        console.error('[watch] Could not start build:', error.message);
    });
    buildProcess.on('close', code => {
        buildProcess = undefined;
        if (stopping) {
            return;
        }
        console.log(code === 0
            ? '[watch] Build ready. Reload the browser with F5.'
            : '[watch] Build failed. Fix the error and save again.');
        runBuild();
    });
}

const watcher = chokidar.watch([
    'map.tmj',
    'src',
    'public',
    'index.html',
    'vite.config.ts',
    'tsconfig.json',
    'package.json',
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local',
], { ignoreInitial: true });

watcher.on('all', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        buildPending = true;
        runBuild();
    }, 500);
});
watcher.on('ready', () => console.log('[watch] Watching map, scripts and assets.'));
watcher.on('error', error => console.error('[watch]', error.message));

async function stop() {
    if (stopping) {
        return;
    }
    stopping = true;
    clearTimeout(debounceTimer);
    await watcher.close();
    if (buildProcess) {
        process.kill(-buildProcess.pid, 'SIGTERM');
    }
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);