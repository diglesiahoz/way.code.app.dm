import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * E2E del stack: specs bajo ./spec (servicio Docker: working_dir = …/test).
 */
const specTestDir = path.resolve(process.cwd(), 'spec');

function envFirst(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v !== undefined && v !== '') return v;
  }
  return undefined;
}

function normalizeBaseURL(raw: string | undefined): string | undefined {
  if (raw === undefined || raw === '') return undefined;
  const t = raw.trim();
  if (!t) return undefined;
  if (/^https?:\/\//i.test(t)) return t;
  return `http://${t}`;
}

const baseURL =
  normalizeBaseURL(envFirst('PLAYWRIGHT_BASE_URL', 'APPSETTING_SERVICE_PLAYWRIGHT_BASE_URL')) ||
  envFirst('PLAYWRIGHT_DEFAULT_BASE_URL', 'APPSETTING_SERVICE_PLAYWRIGHT_DEFAULT_BASE_URL') ||
  normalizeBaseURL(envFirst('APPSETTING_SERVICE_WWW_HOST')) ||
  'http://127.0.0.1';

function isInternalWwwContainer(hostname: string): boolean {
  return /^[a-z0-9._-]+-www$/i.test(hostname);
}

let extraHTTPHeaders: Record<string, string> | undefined;
const vhost = envFirst('PLAYWRIGHT_HTTP_HOST', 'APPSETTING_SERVICE_PLAYWRIGHT_HTTP_HOST');
if (vhost) {
  try {
    const { hostname } = new URL(baseURL);
    if (isInternalWwwContainer(hostname)) {
      extraHTTPHeaders = { Host: vhost };
    }
  } catch {
    /* baseURL inválida */
  }
}

const ignoreHTTPSRaw = envFirst(
  'PLAYWRIGHT_IGNORE_HTTPS_ERRORS',
  'APPSETTING_SERVICE_PLAYWRIGHT_IGNORE_HTTPS_ERRORS',
);
const ignoreHTTPSErrors =
  ignoreHTTPSRaw === '1' || /^true$/i.test(ignoreHTTPSRaw ?? '');

const runStackTestsRaw = envFirst(
  'PLAYWRIGHT_STACK_TESTS',
  'APPSETTING_SERVICE_PLAYWRIGHT_STACK_TESTS',
);
const runStackTests = runStackTestsRaw !== '0';

const chrome = devices['Desktop Chrome'];

const projects: NonNullable<Parameters<typeof defineConfig>[0]['projects']> = [];

if (runStackTests) {
  projects.push({
    name: 'spec',
    testDir: specTestDir,
    use: { ...chrome },
  });
}

if (projects.length === 0) {
  projects.push({
    name: 'spec',
    testDir: specTestDir,
    use: { ...chrome },
  });
}

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL,
    ...(extraHTTPHeaders ? { extraHTTPHeaders } : {}),
    ignoreHTTPSErrors,
    trace: 'on-first-retry',
  },
  projects,
});
