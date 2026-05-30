#!/usr/bin/env node
'use strict';

/**
 * gen_daystats_pdf.cjs
 * Generates 14 day-stats PDFs (7 events × ES + GC) using Playwright headless.
 * Output: public/downloads/studies/<event>-points-<asset>.pdf
 *
 * Usage: node scripts/gen_daystats_pdf.cjs
 */

const { chromium } = require('/Users/angelo/propfirm-compare-site/node_modules/playwright');
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'downloads', 'studies');
const STATIC_DIR = path.join(ROOT, 'out');
const PORT = 8091;

const COMBOS = [
  { event: 'cb-confidence', asset: 'es' },
  { event: 'cb-confidence', asset: 'gc' },
  { event: 'cpi',           asset: 'es' },
  { event: 'cpi',           asset: 'gc' },
  { event: 'durable-goods', asset: 'es' },
  { event: 'durable-goods', asset: 'gc' },
  { event: 'fomc',          asset: 'es' },
  { event: 'fomc',          asset: 'gc' },
  { event: 'ism-mfg',       asset: 'es' },
  { event: 'ism-mfg',       asset: 'gc' },
  { event: 'ism-services',  asset: 'es' },
  { event: 'ism-services',  asset: 'gc' },
  { event: 'philly-fed',    asset: 'es' },
  { event: 'philly-fed',    asset: 'gc' },
];

// ── Serve static export ───────────────────────────────────────────────────────

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Next.js static export with trailingSlash: paths end with /index.html
      let urlPath = req.url.split('?')[0];
      // Strip trailing slash for file lookup (except root)
      if (urlPath.endsWith('/') && urlPath !== '/') urlPath = urlPath + 'index.html';
      if (urlPath === '/') urlPath = '/index.html';

      const filePath = path.join(STATIC_DIR, urlPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mime = {
          '.html': 'text/html; charset=utf-8',
          '.js':   'application/javascript',
          '.css':  'text/css',
          '.json': 'application/json',
          '.woff2': 'font/woff2',
          '.png':  'image/png',
          '.svg':  'image/svg+xml',
          '.pdf':  'application/pdf',
        }[ext] ?? 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(filePath).pipe(res);
      } else {
        // Try index.html in directory
        const indexPath = path.join(STATIC_DIR, urlPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(indexPath).pipe(res);
        } else {
          res.writeHead(404);
          res.end('Not found: ' + urlPath);
        }
      }
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Static server running at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Ensure output dir exists
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Build first
  console.log('Building Next.js static export…');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

  // Start static file server
  const server = await startServer();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 900 },
  });

  const results = [];

  for (const { event, asset } of COMBOS) {
    const filename = `${event}-points-${asset}.pdf`;
    const outPath = path.join(OUT_DIR, filename);
    const url = `http://127.0.0.1:${PORT}/print/daystats/?event=${event}&asset=${asset}&print=1`;

    console.log(`\nGenerating ${filename}…`);
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for chart to be rendered (SVG with data-chart-ready attr)
      await page.waitForFunction(
        () => document.querySelector('[data-chart-ready="true"]') !== null,
        { timeout: 15000 }
      );

      // Extra settle time for fonts
      await page.waitForTimeout(500);

      await page.pdf({
        path: outPath,
        printBackground: true,
        format: 'A4',
        margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
      });

      const size = fs.statSync(outPath).size;
      console.log(`  ✓ ${filename} — ${(size / 1024).toFixed(1)} KB`);
      results.push({ filename, size, ok: true });
    } catch (err) {
      console.error(`  ✗ ${filename} — ERROR: ${err.message}`);
      results.push({ filename, size: 0, ok: false, error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  // Summary
  console.log('\n─── Summary ───');
  const ok = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);
  console.log(`${ok.length}/${results.length} PDFs generated`);
  ok.forEach((r) => console.log(`  ${r.filename} — ${(r.size / 1024).toFixed(1)} KB`));
  if (fail.length) {
    console.log('Failed:');
    fail.forEach((r) => console.log(`  ${r.filename} — ${r.error}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
