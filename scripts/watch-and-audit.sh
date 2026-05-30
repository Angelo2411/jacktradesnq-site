#!/usr/bin/env bash
set -euo pipefail

SIGNAL_FILE="/Users/angelo/jacktradesnq-site/.signal/ready-to-audit"
LOCK_DIR="/tmp/watch-and-audit.lock"
REPO_DIR="/Users/angelo/jacktradesnq-site"
PW_PATH="/Users/angelo/jtnq-hub-v3/node_modules/playwright"
DEV_URL="http://localhost:3000"

echo "[watcher] PID $$ — polling every 30s for $SIGNAL_FILE"

while true; do
    if [ -f "$SIGNAL_FILE" ]; then
        echo "[watcher] signal detected at $(date '+%H:%M:%S')"

        if ! mkdir "$LOCK_DIR" 2>/dev/null; then
            echo "[watcher] lock already held, skipping"
            sleep 30
            continue
        fi

        trap 'rmdir "$LOCK_DIR" 2>/dev/null' EXIT

        SHA=$(git -C "$REPO_DIR" rev-parse --short HEAD)
        BRANCH=$(git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD)
        TS=$(date +%Y%m%d-%H%M%S)
        REPORT="/tmp/audit-${SHA}-${TS}.md"

        {
            echo "# Audit Report"
            echo ""
            echo "**Commit:** $SHA"
            echo "**Branch:** $BRANCH"
            echo "**Timestamp:** $(date '+%Y-%m-%d %H:%M:%S %Z')"
            echo ""

            echo "## TypeScript"
            echo ""
            cd "$REPO_DIR"
            if TSC_OUT=$(npx tsc --noEmit 2>&1); then
                echo "✅ clean"
            else
                echo '```'
                echo "$TSC_OUT"
                echo '```'
            fi
            echo ""

            echo "## Build"
            echo ""
            if BUILD_OUT=$(npm run build 2>&1); then
                echo '```'
                echo "$BUILD_OUT" | grep -E '(Compiled successfully|✓|/[^ ]+ [0-9]+)' || echo "$BUILD_OUT" | tail -50
                echo '```'
            else
                echo '```'
                echo "$BUILD_OUT" | tail -50
                echo '```'
            fi
            echo ""

            echo "## Console (Playwright headless)"
            echo ""

            if ! curl -s -o /dev/null -w "%{http_code}" "$DEV_URL" | grep -q "200\|30[0-9]"; then
                echo "⚠️ Dev server not running on :3000"
            else
                node -e "
                const playwright = require('$PW_PATH');
                (async () => {
                  const pages = ['/', '/studies/cpi-day-stats/', '/studies/nfp/'];
                  const results = [];
                  const browser = await playwright.chromium.launch({ headless: true });
                  const context = await browser.newContext();
                  for (const pagePath of pages) {
                    const page = await context.newPage();
                    const errors = [];
                    const warnings = [];
                    page.on('console', msg => {
                      if (msg.type() === 'error') errors.push(msg.text());
                      if (msg.type() === 'warning') warnings.push(msg.text());
                    });
                    try {
                      await page.goto('$DEV_URL' + pagePath, { waitUntil: 'networkidle', timeout: 15000 });
                    } catch (e) {
                      errors.push('Navigation failed: ' + e.message);
                    }
                    await page.close();
                    results.push({ page: pagePath, errors, warnings });
                  }
                  await browser.close();
                  console.log(JSON.stringify(results, null, 2));
                })().catch(e => {
                  console.error('FATAL:', e.message);
                  process.exit(1);
                });
                " > /tmp/playwright-output.json 2>/tmp/playwright-stderr.log

                if [ -s /tmp/playwright-output.json ]; then
                    node -e "
                    const data = JSON.parse(require('fs').readFileSync('/tmp/playwright-output.json', 'utf8'));
                    for (const entry of data) {
                      console.log('**Page:** ' + entry.page + '\n');
                      if (entry.errors.length === 0 && entry.warnings.length === 0) {
                        console.log('✅ no console errors/warnings\n');
                      } else {
                        if (entry.errors.length > 0) {
                          console.log('Errors:');
                          for (const e of entry.errors) console.log('- ' + e);
                          console.log('');
                        }
                        if (entry.warnings.length > 0) {
                          console.log('Warnings:');
                          for (const w of entry.warnings) console.log('- ' + w);
                          console.log('');
                        }
                      }
                    }
                    "
                elif [ -s /tmp/playwright-stderr.log ]; then
                    echo "❌ Playwright fatal error:"
                    echo '```'
                    cat /tmp/playwright-stderr.log
                    echo '```'
                else
                    echo "⚠️ Dev server not running on :3000"
                fi
                rm -f /tmp/playwright-output.json /tmp/playwright-stderr.log
            fi
            echo ""
        } > "$REPORT"

        rm -f "$SIGNAL_FILE"
        rmdir "$LOCK_DIR" 2>/dev/null
        trap - EXIT
        echo "Audit done: $REPORT"
    fi
    sleep 30
done
