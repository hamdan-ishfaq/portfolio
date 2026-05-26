import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function testPage(page, path, checks) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
  for (const check of checks) {
    await check(page);
  }
  console.log(`PASS: ${path}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await testPage(page, '/', [
    async (p) => { await p.locator('#home').waitFor({ state: 'visible' }); },
    async (p) => { await p.locator('#projects').waitFor({ state: 'visible' }); },
    async (p) => { await p.locator('#contact').waitFor({ state: 'visible' }); },
  ]);

  await testPage(page, '/projects/test-project', [
    async (p) => {
      await p.getByRole('button', { name: /Request Live Demo/i }).click();
      await p.waitForSelector('[role="dialog"]');
      const box = await p.locator('[role="dialog"]').boundingBox();
      if (!box || box.width < 300) throw new Error(`Modal too narrow: ${box?.width}px`);
      await p.getByLabel('Close dialog').click();
    },
  ]);

  await page.setViewportSize({ width: 390, height: 844 });
  await testPage(page, '/projects/test-project', [
    async (p) => {
      await p.getByRole('button', { name: /Request Live Demo/i }).click();
      const box = await p.locator('[role="dialog"]').boundingBox();
      if (!box || box.width < 300) throw new Error(`Mobile modal too narrow: ${box?.width}px`);
      await p.screenshot({ path: 'scripts/smoke-mobile-modal.png' });
    },
  ]);

  console.log('\nAll smoke tests passed.');
  await browser.close();
}

main().catch((err) => {
  console.error('FAIL:', err.message || err);
  process.exit(1);
});
