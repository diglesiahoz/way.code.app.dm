#!/usr/bin/env node
/**
 * build:doc — genera doc/md/ desde archivos .md del proyecto (espejo jerárquico).
 *
 * Uso (desde la raíz del proyecto):
 *   node doc/scripts/build-doc.mjs
 *   node doc/scripts/build-doc.mjs --clean
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
  };
  for (const arg of argv) {
    if (arg === '--clean') opts.clean = true;
    if (arg === '--dry-run') opts.dryRun = true;
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
    slug: '/',
  });
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
  fs.writeFileSync(filePath, content, 'utf8');
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
    if (subdirs.length > 0) dirs.push(dir);
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
    if (skipCategoryDirs.has(dir)) continue;
    const rel = path.relative(mdRoot, dir);
    const name = path.basename(dir);
    const parentParts = rel.split(path.sep).filter(Boolean).slice(0, -1);
    const category = {
      label: categoryLabel(name),
      position: categoryPosition(name, parentParts),
      collapsed: name === 'custom' ? false : true,
    };
    writeFile(path.join(dir, '_category_.json'), JSON.stringify(category, null, 2) + '\n', dryRun);
  }
}

function removeStaleSynced(mdRoot, validOutFiles, dryRun) {
  if (!fs.existsSync(mdRoot)) return;

  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.name === 'index.md' || ent.name === '_category_.json') {
        if (ent.name === '_category_.json') continue;
        if (validOutFiles.has(full)) continue;
        const raw = fs.readFileSync(full, 'utf8');
        if (raw.includes('synced_from_project: true') || raw.includes('synced_from_web: true')) {
          if (dryRun) console.log(`[dry-run] remove stale ${full}`);
          else fs.unlinkSync(full);
        }
      }
    }
  }

  walk(mdRoot);
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

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const docDir = path.resolve(__dirname, '..');
  const projectRoot = opts.projectRoot;

  if (!fs.existsSync(projectRoot)) {
    console.error(`Not found project root: ${projectRoot}`);
    process.exit(1);
  }

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

  for (const { markdownPath, relDir, baseName } of markdownFiles) {
    const sourceRel = path.relative(projectRoot, markdownPath).split(path.sep).join('/');
    const isReadme = README_RE.test(path.basename(markdownPath));
    const isProjectHomeReadme = relDir === '' && isReadme;
    const outDir = relDir === '' ? opts.out : path.join(opts.out, relDir);
    const outFile = isReadme
      ? path.join(outDir, 'index.md')
      : path.join(outDir, `${baseName}.md`);

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

    ensureDir(outDir, opts.dryRun);
    writeFile(outFile, doc, opts.dryRun);
    validOut.add(outFile);
    console.log(`${sourceRel} → doc/md/${path.relative(opts.out, outFile)}`);
    if (!isProjectHomeReadme) position += 10;
  }

  if (opts.clean) {
    removeStaleSynced(opts.out, validOut, opts.dryRun);
  }

  ensureDir(opts.out, opts.dryRun);
  writeCategoryFiles(opts.out, opts.dryRun);

  console.log(`\Done: ${markdownFiles.length} markdown file(s) → ${opts.out}`);

}

main();
