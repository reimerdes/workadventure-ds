import 'dotenv/config';

import {defineConfig} from 'vite';
import {getMaps, getMapsOptimizers, getMapsScripts, LogLevel, OptimizeOptions} from 'wa-map-optimizer-vite';

const maps = getMaps();
const logLevel = process.env.LOG_LEVEL as keyof typeof LogLevel | undefined;

let optimizerOptions: OptimizeOptions = {
  logs: logLevel && logLevel in LogLevel ? LogLevel[logLevel] : LogLevel.NORMAL,
};

if (process.env.TILESET_OPTIMIZATION &&
    process.env.TILESET_OPTIMIZATION === 'true') {
  const qualityMin = Number.parseFloat(
      process.env.TILESET_OPTIMIZATION_QUALITY_MIN ?? '0.9');
  const qualityMax = Number.parseFloat(
      process.env.TILESET_OPTIMIZATION_QUALITY_MAX ?? '1');

  if (!Number.isFinite(qualityMin) || !Number.isFinite(qualityMax) ||
      qualityMin < 0 || qualityMax > 1 || qualityMin > qualityMax) {
    throw new Error(
        'Tileset optimization quality must satisfy 0 <= min <= max <= 1');
  }

  optimizerOptions.output = {
    tileset: {
      compress: {
        quality: [qualityMin, qualityMax],
      }
    }
  }
}

export default defineConfig({
  base: './',
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        index: './index.html',
        ...getMapsScripts(maps),
      },
    },
  },
  plugins: [...getMapsOptimizers(maps, optimizerOptions)],
  server: {
    host: 'localhost',
    allowedHosts: ['.loca.lt'],
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    open: process.env.VITE_OPEN === 'false' ? false : '/',
  },
});
