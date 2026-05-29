#!/usr/bin/env node
/**
 * Desarrollo: sincroniza .md del proyecto (watch) + docusaurus start (baseUrl /).
 * Producción: npm run build:doc && npm run build (sin demonio).
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = {
  ...process.env,
  DOCUSAURUS_BASE_URL: '/',
};

const watch = spawn(
  process.execPath,
  ['scripts/build-doc.mjs', '--watch-dev', '--skip-initial-build'],
  { cwd: docDir, env, stdio: 'inherit' },
);

const docusaurusBin = path.join(docDir, 'node_modules/@docusaurus/core/bin/docusaurus.mjs');
const docusaurus = spawn(
  process.execPath,
  [docusaurusBin, 'start', '--host', '0.0.0.0'],
  { cwd: docDir, env, stdio: 'inherit' },
);

function shutdown(signal) {
  watch.kill(signal);
  docusaurus.kill(signal);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

docusaurus.on('exit', (code, signal) => {
  watch.kill();
  process.exit(code ?? (signal ? 1 : 0));
});

watch.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`[dev] watch exited with code ${code}`);
  }
});
