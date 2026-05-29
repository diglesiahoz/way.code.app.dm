#!/usr/bin/env node
/**
 * Limpia cachés de Docusaurus (equivalente robusto a `docusaurus clear`).
 * Usa rm recursivo porque `docusaurus clear` puede fallar con ENOTEMPTY.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const rel of ['.docusaurus', 'node_modules/.cache']) {
  const full = path.join(docDir, rel);
  if (!fs.existsSync(full)) continue;
  fs.rmSync(full, { recursive: true, force: true });
  console.log(`Removed ${rel}`);
}
