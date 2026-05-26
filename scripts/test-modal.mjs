import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(`${BASE}/projects/test-project`, { waitUntil: 'networkidle' });

  const demoBtn = page.getByRole('button', { name: /Request Live Demo/i });
  await demoBtn.waitFor({ state: 'visible', timeout: 15000 });
  await demoBtn.click();

  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  const dialog = page.locator('[role="dialog"]');
  const box = await dialog.boundingBox();
  const styles = await dialog.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      width: cs.width,
      height: cs.height,
      display: cs.display,
      position: cs.position,
      maxWidth: cs.maxWidth,
      minWidth: cs.minWidth,
      className: el.className,
    };
  });

  await page.screenshot({ path: 'scripts/modal-test-desktop.png', fullPage: false });

  console.log('Desktop dialog bounding box:', box);
  console.log('Desktop dialog computed styles:', styles);

  const ok = box && box.width > 300;
  console.log(ok ? 'PASS: dialog width looks correct' : 'FAIL: dialog width collapsed');

  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Request Live Demo/i }).click();
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  const mobileBox = await page.locator('[role="dialog"]').boundingBox();
  const mobileStyles = await page.locator('[role="dialog"]').evaluate((el) => {
    const cs = getComputedStyle(el);
    return { width: cs.width, height: cs.height, maxWidth: cs.maxWidth };
  });

  await page.screenshot({ path: 'scripts/modal-test-mobile.png', fullPage: false });
  console.log('Mobile dialog bounding box:', mobileBox);
  console.log('Mobile dialog computed styles:', mobileStyles);

  const mobileOk = mobileBox && mobileBox.width > 300;
  console.log(mobileOk ? 'PASS: mobile dialog width looks correct' : 'FAIL: mobile dialog width collapsed');

  await browser.close();
  process.exit(ok && mobileOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
