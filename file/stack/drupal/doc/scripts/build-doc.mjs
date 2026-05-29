#!/usr/bin/env node
/**
 * build:doc — genera doc/md/ desde archivos .md del proyecto (espejo jerárquico).
 *
 * Uso (desde la raíz del proyecto):
 *   node doc/scripts/build-doc.mjs
 *   node doc/scripts/build-doc.mjs --clean
 *   node doc/scripts/build-doc.mjs --watch
 *
 * Variables: DOC_PROJECT_ROOT, DOC_MD_OUT
 *
 * Excluye: doc/, contrib, drupal/web/README.md (core), core/, tests/fixtures.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT_SEGMENT_ORDER = ['private', 'drupal', 'test', '.dm'];

const WEB_SEGMENT_ORDER = [
  'modules',
  'profiles',
  'sites',
  'themes',
  'libraries',
  'core',
  'assets',
  'files',
];

const CUSTOM_ORDER = { custom: 20 };

const README_RE = /^readme\.md$/i;
const MARKDOWN_RE = /\.md$/i;

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  'vendor',
  'build',
  '.docusaurus',
  'doc',
]);

const CATEGORY_LABELS = {
  drupal: 'drupal',
  web: 'web',
  recipes: 'recipes',
  private: 'private',
  test: 'test',
  modules: 'modules',
  themes: 'themes',
  profiles: 'profiles',
  sites: 'sites',
  custom: 'custom',
  sh: 'sh',
};

const WEB_SKIP_REGEX = /\/(tests|fixtures|node_modules)\//;

const TOP_LEVEL_CATEGORY = {
  private: { label: 'private', position: 20, collapsed: false },
  drupal: { label: 'drupal', position: 30, collapsed: false },
  test: { label: 'test', position: 40, collapsed: true },
  '.dm': { label: '.dm', position: 50, collapsed: true },
};

function parseArgs(argv) {
  const opts = {
    projectRoot: process.env.DOC_PROJECT_ROOT || '',
    out: process.env.DOC_MD_OUT || '',
    clean: false,
    dryRun: false,
    watch: false,
    invalidateDocusaurus: false,
    skipInitialBuild: false,
    watchDev: false,
  };
  for (const arg of argv) {
    if (arg === '--clean') opts.clean = true;
    if (arg === '--dry-run') opts.dryRun = true;
    if (arg === '--watch') opts.watch = true;
    if (arg === '--watch-dev') {
      opts.watch = true;
      opts.watchDev = true;
    }
    if (arg === '--skip-initial-build') opts.skipInitialBuild = true;
    if (arg.startsWith('--root=')) opts.projectRoot = arg.slice(7);
    if (arg.startsWith('--out=')) opts.out = arg.slice(6);
  }
  const docDir = path.resolve(__dirname, '..');
  const defaultProjectRoot = path.resolve(docDir, '..');
  if (!opts.projectRoot) opts.projectRoot = defaultProjectRoot;
  if (!opts.out) opts.out = path.join(docDir, 'md');
  opts.projectRoot = path.resolve(opts.projectRoot);
  opts.out = path.resolve(opts.out);
  return opts;
}

function rootSegmentRank(name) {
  const i = ROOT_SEGMENT_ORDER.indexOf(name.toLowerCase());
  return i === -1 ? 1000 + name.toLowerCase().charCodeAt(0) : i;
}

function webSegmentRank(name) {
  const i = WEB_SEGMENT_ORDER.indexOf(name.toLowerCase());
  return i === -1 ? 1000 + name.toLowerCase().charCodeAt(0) : i;
}

function comparePathSegments(aParts, bParts) {
  const len = Math.min(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const aSeg = aParts[i];
    const bSeg = bParts[i];
    const parent = aParts.slice(0, i);

    if (i === 0) {
      const ra = rootSegmentRank(aSeg);
      const rb = rootSegmentRank(bSeg);
      if (ra !== rb) return ra - rb;
    }

    if (
      aParts[0] === 'drupal' &&
      aParts[1] === 'web' &&
      parent[0] === 'drupal' &&
      parent[1] === 'web' &&
      aSeg === 'custom' &&
      bSeg === 'custom'
    ) {
      return 0;
    }

    if (aParts[0] === 'drupal' && aParts[1] === 'web' && i >= 2) {
      const ra = webSegmentRank(aSeg);
      const rb = webSegmentRank(bSeg);
      if (ra !== rb) return ra - rb;
    }

    const lc = aSeg.localeCompare(bSeg, undefined, { sensitivity: 'base' });
    if (lc !== 0) return lc;
  }
  return aParts.length - bParts.length;
}

function findMarkdownFiles(projectRoot) {
  const results = [];

  function walk(dir, relFromRoot) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue;
      const full = path.join(dir, ent.name);
      const relDir = relFromRoot ? path.join(relFromRoot, ent.name) : ent.name;
      if (ent.isDirectory()) {
        walk(full, relDir);
      } else if (ent.isFile() && MARKDOWN_RE.test(ent.name)) {
        results.push({
          markdownPath: full,
          baseName: path.parse(ent.name).name,
          relDir: relFromRoot || '',
        });
      }
    }
  }

  walk(projectRoot, '');
  results.sort((a, b) => {
    const aParts = a.relDir === '' ? [] : a.relDir.split(path.sep);
    const bParts = b.relDir === '' ? [] : b.relDir.split(path.sep);
    return comparePathSegments(aParts, bParts);
  });
  return results;
}

function relDirUsesPosix(relDir) {
  return relDir.split(path.sep).join('/');
}

/** Filtro único build:doc (sin contrib, sin README core en drupal/web). */
function passesBuildDocScope(relDir, fileName) {
  const posix = relDirUsesPosix(relDir);
  const lowerFile = (fileName || '').toLowerCase();
  if (posix === 'doc' || posix.startsWith('doc/')) return false;
  if (posix === 'drupal/web' && lowerFile === 'readme.md') return false;
  if (posix.includes('/contrib/')) return false;
  if (posix.startsWith('drupal/web/core/') && lowerFile === 'readme.md') return false;
  if (posix.startsWith('drupal/web/libraries/')) return false;
  if (WEB_SKIP_REGEX.test(posix)) return false;

  if (posix === '') return true;
  if (posix.startsWith('private/') || posix.startsWith('test/') || posix.startsWith('.dm/')) {
    return true;
  }
  if (posix.startsWith('drupal/web/modules/custom/')) return true;
  if (posix.startsWith('drupal/web/themes/custom/')) return true;
  if (posix.startsWith('drupal/web/profiles/custom/')) return true;
  if (posix.startsWith('drupal/web/sites/')) return true;
  if (posix === 'recipes' || posix.startsWith('recipes/')) return true;
  if (posix === 'drupal/recipes' || posix.startsWith('drupal/recipes/')) return true;
  return false;
}

function humanizeSegment(name) {
  if (!name) return 'Raíz';
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function categoryLabel(folderName) {
  return CATEGORY_LABELS[folderName] ?? humanizeSegment(folderName);
}

function categoryPosition(folderName, parentRelParts) {
  if (folderName === 'custom') return CUSTOM_ORDER.custom;
  if (folderName === 'web') return 1;
  if (folderName === 'modules') return 1;
  if (folderName === 'themes') return 2;
  if (folderName === 'profiles') return 3;
  if (folderName === 'sites') return 4;
  if (TOP_LEVEL_CATEGORY[folderName]) return TOP_LEVEL_CATEGORY[folderName].position;
  return webSegmentRank(folderName) + 1;
}

function extractTitle(markdown, fallback) {
  const m = markdown.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim().replace(/\s+#+$/g, '');
  return humanizeSegment(path.basename(fallback));
}

const FENCED_CODE_RE = /```[\w-]*\r?\n[\s\S]*?```/g;

function splitMarkdownSegments(markdown) {
  const segments = [];
  let last = 0;
  for (const m of markdown.matchAll(FENCED_CODE_RE)) {
    if (m.index > last) {
      segments.push({ type: 'text', content: markdown.slice(last, m.index) });
    }
    segments.push({ type: 'fence', content: m[0] });
    last = m.index + m[0].length;
  }
  if (last < markdown.length) {
    segments.push({ type: 'text', content: markdown.slice(last) });
  }
  return segments.length ? segments : [{ type: 'text', content: markdown }];
}

function fixAngleBracketAutolinks(text) {
  return text.replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/gi, (_, url) => `[${url}](${url})`);
}

function neutralizeTwigMustache(text) {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, inner) => `\`{{${inner}}}\``);
}

function escapeMdxCurlyBraces(text) {
  return text
    .replace(/(?<!\\)(?<!\{)\{(?!\{)/g, '\\{')
    .replace(/(?<!\\)(?<!\})\}(?!\})/g, '\\}');
}

function sanitizeVoidHtmlTags(text) {
  const voidTags = ['img', 'br', 'hr', 'input', 'source', 'track', 'wbr', 'area', 'col', 'embed'];
  let out = text;
  for (const tag of voidTags) {
    out = out.replace(new RegExp(`<${tag}(\\s[^>]*)?\\s*/>`, 'gi'), (m) => m);
    out = out.replace(new RegExp(`<${tag}(\\s[^>]*?)>`, 'gi'), (_, attrs) => `<${tag}${attrs} />`);
  }
  return out;
}

function escapeInvalidAngleBrackets(text) {
  return text.replace(/<(?!\/?[a-z][a-z0-9]*\b[^>]*\/?>)/gi, '&lt;');
}

/** Enlaces a README.md del repo → rutas de doc (carpeta con index.md en Docusaurus). */
function rewriteReadmeLinksForDocs(text) {
  return text.replace(/\]\(([^)]+)\)/g, (full, href) => {
    if (!/README\.md/i.test(href)) return full;
    const hashIdx = href.search(/#/);
    const hash = hashIdx === -1 ? '' : href.slice(hashIdx);
    let path = hashIdx === -1 ? href : href.slice(0, hashIdx);
    path = path.replace(/README\.md\/?$/i, '').replace(/README\.md\/?/gi, '');
    if (!path || path === '.') path = '.';
    else if (!path.endsWith('/')) path += '/';
    return `](${path}${hash})`;
  });
}

function sanitizeTextSegmentForMdx(text) {
  let out = text;
  out = rewriteReadmeLinksForDocs(out);
  out = fixAngleBracketAutolinks(out);
  out = sanitizeVoidHtmlTags(out);
  out = escapeInvalidAngleBrackets(out);
  out = escapeMdxCurlyBraces(out);
  out = neutralizeTwigMustache(out);
  return out;
}

function sanitizeFenceForMdx(fence) {
  return fence.replace(/\{\{/g, '\\{\\{').replace(/\}\}/g, '\\}\\}');
}

function sanitizeMarkdownForMdx(markdown) {
  return splitMarkdownSegments(markdown)
    .map((seg) =>
      seg.type === 'fence'
        ? sanitizeFenceForMdx(seg.content)
        : sanitizeTextSegmentForMdx(seg.content),
    )
    .join('');
}

function yamlEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function stripLeadingFrontmatter(markdown) {
  if (!markdown.startsWith('---')) return markdown;
  const end = markdown.indexOf('\n---', 3);
  if (end === -1) return markdown;
  return markdown.slice(end + 4).replace(/^\n/, '');
}

function parseSimpleFrontmatter(markdown) {
  if (!markdown.startsWith('---')) return {};
  const end = markdown.indexOf('\n---', 3);
  if (end === -1) return {};
  const yaml = markdown.slice(3, end);
  const pick = (key) => {
    const m = yaml.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'));
    return m ? m[1].trim() : undefined;
  };
  return {
    title: pick('title'),
    sidebar_label: pick('sidebar_label'),
  };
}

function buildFrontmatter({ title, sidebarLabel, sidebarPosition, sourceRel, slug }) {
  const lines = [
    '---',
    `title: "${yamlEscape(title)}"`,
    `sidebar_label: "${yamlEscape(sidebarLabel)}"`,
    `sidebar_position: ${sidebarPosition}`,
  ];
  if (slug) lines.push(`slug: ${slug}`);
  lines.push('synced_from_project: true', `source_readme: "${yamlEscape(sourceRel)}"`, '---', '');
  return lines.join('\n');
}

function buildHomeFrontmatter({ title, sidebarLabel, sourceRel }) {
  return buildFrontmatter({
    title,
    sidebarLabel,
    sidebarPosition: 1,
    sourceRel,
  });
}

/** Nombre de fichero .md seguro para rutas Docusaurus (sin espacios ni paréntesis). */
function safeDocBaseName(baseName) {
  return baseName
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'doc';
}

function ensureDir(dir, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] write ${filePath}`);
    return;
  }
  writeFileAtomic(filePath, content);
}

function writeFileAtomic(filePath, content) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

function writeCategoryFiles(mdRoot, dryRun) {
  const dirs = [];

  function collect(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    const subdirs = entries.filter((e) => e.isDirectory());
    const hasDirectMd = entries.some((e) => e.isFile() && MARKDOWN_RE.test(e.name));
    if (subdirs.length > 0 || hasDirectMd) dirs.push(dir);
    for (const sd of subdirs) collect(path.join(dir, sd.name));
  }

  if (fs.existsSync(mdRoot) || !dryRun) collect(mdRoot);

  for (const [folder, meta] of Object.entries(TOP_LEVEL_CATEGORY)) {
    const dir = path.join(mdRoot, folder);
    if (!fs.existsSync(dir)) continue;
    writeFile(path.join(dir, '_category_.json'), JSON.stringify(meta, null, 2) + '\n', dryRun);
  }

  const webDir = path.join(mdRoot, 'drupal', 'web');
  if (fs.existsSync(webDir) || !dryRun) {
    ensureDir(webDir, dryRun);
    writeFile(
      path.join(webDir, '_category_.json'),
      JSON.stringify({ label: 'web', position: 1, collapsed: false }, null, 2) + '\n',
      dryRun,
    );
  }

  const skipCategoryDirs = new Set([
    mdRoot,
    path.join(mdRoot, 'drupal'),
    webDir,
    ...Object.keys(TOP_LEVEL_CATEGORY).map((k) => path.join(mdRoot, k)),
  ]);

  for (const dir of dirs) {
    writeCategoryJsonForDir(dir, mdRoot, dryRun);
  }
}

function writeCategoryJsonForDir(dir, mdRoot, dryRun) {
  const webDir = path.join(mdRoot, 'drupal', 'web');
  const skipCategoryDirs = new Set([
    mdRoot,
    path.join(mdRoot, 'drupal'),
    webDir,
    ...Object.keys(TOP_LEVEL_CATEGORY).map((k) => path.join(mdRoot, k)),
  ]);
  if (skipCategoryDirs.has(dir)) return;
  const rel = path.relative(mdRoot, dir);
  if (!rel || rel.startsWith('..')) return;
  const name = path.basename(dir);
  const parentParts = rel.split(path.sep).filter(Boolean).slice(0, -1);
  const category = {
    label: categoryLabel(name),
    position: categoryPosition(name, parentParts),
    collapsed: name === 'custom' ? false : true,
  };
  writeFile(path.join(dir, '_category_.json'), JSON.stringify(category, null, 2) + '\n', dryRun);
}

const REMOVED_DOC_TOMBSTONE = `---
title: "(eliminado)"
draft: true
---

El documento fuente ya no existe en el proyecto. Un \`npm run build:doc --clean\` elimina estas páginas huérfanas.

`;

function pruneOrphanDocDirs(mdRoot, dryRun) {
  if (!fs.existsSync(mdRoot)) return;

  function dirHasMarkdown(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (dirHasMarkdown(full)) return true;
      } else if (MARKDOWN_RE.test(ent.name)) {
        return true;
      }
    }
    return false;
  }

  function prune(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const full = path.join(dir, ent.name);
      prune(full);
      if (dirHasMarkdown(full)) continue;
      const rel = path.relative(mdRoot, full);
      const categoryFile = path.join(full, '_category_.json');
      if (dryRun) {
        console.log(`[dry-run] prune empty doc/md/${rel}`);
        continue;
      }
      if (fs.existsSync(categoryFile)) fs.unlinkSync(categoryFile);
      try {
        fs.rmdirSync(full);
        console.log(`pruned empty doc/md/${rel}`);
      } catch {
        // directorio no vacío
      }
    }
  }

  prune(mdRoot);
}

function listStaleSynced(mdRoot, validOutFiles) {
  const stale = [];
  if (!fs.existsSync(mdRoot)) return stale;

  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
        continue;
      }
      if (!MARKDOWN_RE.test(ent.name)) continue;
      if (validOutFiles.has(full)) continue;
      let raw;
      try {
        raw = fs.readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      if (raw.includes('synced_from_project: true') || raw.includes('synced_from_web: true')) {
        stale.push(full);
      }
    }
  }

  walk(mdRoot);
  return stale;
}

function removeStaleSynced(mdRoot, validOutFiles, dryRun, softRemove = false) {
  const stale = listStaleSynced(mdRoot, validOutFiles);
  for (const full of stale) {
    const rel = path.relative(mdRoot, full);
    if (dryRun) {
      console.log(`[dry-run] remove stale ${rel}`);
      continue;
    }
    if (softRemove) {
      writeFileAtomic(full, REMOVED_DOC_TOMBSTONE);
      console.log(`[watch] marked removed (tombstone) doc/md/${rel}`);
    } else {
      fs.unlinkSync(full);
      console.log(`removed stale doc/md/${rel}`);
    }
  }
  return stale.length;
}

function removeLegacyOutDirs(docDir, dryRun) {
  for (const legacy of ['md/web', 'md/drupal/web']) {
    const full = path.join(docDir, legacy);
    if (!fs.existsSync(full)) continue;
    if (dryRun) {
      console.log(`[dry-run] remove legacy ${full}`);
      continue;
    }
    fs.rmSync(full, { recursive: true, force: true });
  }
}

function cleanOutputDir(mdRoot, dryRun) {
  if (!fs.existsSync(mdRoot)) return;
  let entries = [];
  try {
    entries = fs.readdirSync(mdRoot, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.name === '.gitkeep') continue;
    const full = path.join(mdRoot, ent.name);
    if (dryRun) {
      console.log(`[dry-run] clean ${full}`);
      continue;
    }
    fs.rmSync(full, { recursive: true, force: true });
  }
}

function isWatchIgnored(relFromRoot) {
  if (!relFromRoot) return false;
  const posix = relFromRoot.split(path.sep).join('/');
  if (posix === 'doc' || posix.startsWith('doc/')) return true;
  const parts = relFromRoot.split(path.sep);
  return parts.some((p) => SKIP_DIR_NAMES.has(p));
}

function watchMarkdownRelParts(projectRoot, filePath) {
  if (!MARKDOWN_RE.test(path.basename(filePath))) return null;
  const rel = path.relative(projectRoot, filePath);
  if (rel.startsWith('..') || rel === '') return null;
  const relDir = path.dirname(rel);
  const relDirKey = relDir === '.' ? '' : relDir;
  if (isWatchIgnored(relDirKey)) return null;
  const fileName = path.basename(filePath);
  if (!passesBuildDocScope(relDirKey, fileName)) return null;
  return { rel, relDirKey, fileName };
}

function shouldWatchMarkdownFile(projectRoot, filePath) {
  return watchMarkdownRelParts(projectRoot, filePath) !== null;
}

function runBuild(opts) {
  const docDir = path.resolve(__dirname, '..');
  const projectRoot = opts.projectRoot;

  let markdownFiles = findMarkdownFiles(projectRoot).filter((f) =>
    passesBuildDocScope(f.relDir, path.basename(f.markdownPath)),
  );
  if (markdownFiles.length === 0) {
    console.warn('Not found .md files with build:doc filter.');
  }

  if (opts.clean) {
    removeLegacyOutDirs(docDir, opts.dryRun);
    cleanOutputDir(opts.out, opts.dryRun);
  }

  const validOut = new Set();
  let position = 10;
  const outputs = [];

  for (const { markdownPath, relDir, baseName } of markdownFiles) {
    const sourceRel = path.relative(projectRoot, markdownPath).split(path.sep).join('/');
    const isReadme = README_RE.test(path.basename(markdownPath));
    const isProjectHomeReadme = relDir === '' && isReadme;
    const outDir = relDir === '' ? opts.out : path.join(opts.out, relDir);
    const outFile = isReadme
      ? path.join(outDir, 'index.md')
      : path.join(outDir, `${safeDocBaseName(baseName)}.md`);

    const rawBody = fs.readFileSync(markdownPath, 'utf8');
    const fm = parseSimpleFrontmatter(rawBody);
    const stripped = stripLeadingFrontmatter(rawBody.replace(/^\uFEFF/, ''));
    const body = sanitizeMarkdownForMdx(stripped);
    const title = fm.title || extractTitle(stripped, baseName || 'README');
    const sidebarLabel = isProjectHomeReadme
      ? fm.sidebar_label || '🚀 Home'
      : (isReadme ? path.basename(relDir || baseName) : humanizeSegment(baseName));

    const doc = isProjectHomeReadme
      ? buildHomeFrontmatter({ title, sidebarLabel, sourceRel }) + body
      : buildFrontmatter({
          title,
          sidebarLabel,
          sidebarPosition: position,
          sourceRel,
        }) + body;

    outputs.push({ sourceRel, outDir, outFile, doc });
    validOut.add(outFile);
    if (!isProjectHomeReadme) position += 10;
  }

  const outDirs = [...new Set(outputs.map((o) => o.outDir))];
  for (const outDir of outDirs) {
    ensureDir(outDir, opts.dryRun);
    if (!opts.dryRun) writeCategoryJsonForDir(outDir, opts.out, opts.dryRun);
  }
  for (const { sourceRel, outFile, doc } of outputs) {
    writeFile(outFile, doc, opts.dryRun);
    console.log(`${sourceRel} → doc/md/${path.relative(opts.out, outFile)}`);
  }

  let staleRemoved = 0;
  if (!opts.dryRun) {
    staleRemoved = removeStaleSynced(opts.out, validOut, opts.dryRun, opts.invalidateDocusaurus);
    if (staleRemoved > 0 && !opts.invalidateDocusaurus) {
      pruneOrphanDocDirs(opts.out, opts.dryRun);
    }
  }

  ensureDir(opts.out, opts.dryRun);
  writeCategoryFiles(opts.out, opts.dryRun);

  console.log(`\nDone: ${markdownFiles.length} markdown file(s) → ${opts.out}`);
  return { count: markdownFiles.length, staleRemoved };
}

async function runWatch(opts) {
  const chokidar = (await import('chokidar')).default;
  const debounceMs = 700;
  let timer;
  let building = false;

  const scheduleRebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (building) return;
      building = true;
      try {
        const label = opts.watchDev ? 'watch:dev' : 'watch';
        console.log(`\n[${label}] Sincronizando .md → doc/md/…`);
        runBuild({
          ...opts,
          clean: false,
          invalidateDocusaurus: Boolean(opts.watchDev),
        });
      } finally {
        building = false;
      }
    }, debounceMs);
  };

  const watcher = chokidar.watch(opts.projectRoot, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
    ignored: (absPath) => {
      const rel = path.relative(opts.projectRoot, absPath);
      if (!rel || rel.startsWith('..')) return false;
      return isWatchIgnored(rel);
    },
  });

  watcher.on('all', (event, filePath) => {
    if (event === 'unlinkDir') {
      const relDir = path.relative(opts.projectRoot, filePath);
      if (!relDir || relDir.startsWith('..') || isWatchIgnored(relDir)) return;
      console.log(`[watch] ${event} ${relDir}`);
      scheduleRebuild();
      return;
    }

    const parts = watchMarkdownRelParts(opts.projectRoot, filePath);
    if (!parts) return;
    console.log(`[watch] ${event} ${parts.rel}`);
    scheduleRebuild();
  });

  if (opts.watchDev) {
    console.log(`[watch:dev] Watching .md under ${opts.projectRoot}`);
  } else {
    console.log(`[watch] Watching .md under ${opts.projectRoot}`);
  }
  await new Promise(() => {});
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(opts.projectRoot)) {
    console.error(`Not found project root: ${opts.projectRoot}`);
    process.exit(1);
  }

  if (opts.watch) {
    if (!opts.skipInitialBuild) runBuild(opts);
    await runWatch(opts);
    return;
  }

  runBuild(opts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
