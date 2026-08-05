import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`  ok  ${message}`);
}

async function openSimulator(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.getByRole('button', { name: /Run simulation/i }).click();
  await page.waitForSelector('[role="dialog"]', { timeout: 15000 });
}

async function step(page, name) {
  await page
    .getByRole('dialog')
    .getByRole('button', { name: new RegExp(`^${name}`, 'i') })
    .click();
}

async function ledgerText(page) {
  return page.getByRole('dialog').textContent();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('lazy loading');
  const scripts = [];
  page.on('response', (res) => {
    if (res.url().endsWith('.js') || res.url().includes('.js?')) scripts.push(res.url());
  });

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.locator('#home').waitFor({ state: 'visible' });
  await page.screenshot({ path: 'scripts/hero.png' });
  const beforeOpen = scripts.length;

  await page.getByRole('button', { name: /Run simulation/i }).click();
  await page.waitForSelector('[role="dialog"]', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  assert(
    scripts.length > beforeOpen,
    `simulator code is fetched only on demand (+${scripts.length - beforeOpen} chunks)`
  );

  console.log('\ndriving');
  // The truck spawns on the ring road facing the requisition office.
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(1400);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(300);
  let text = await ledgerText(page);
  assert(/10004521/.test(text), 'driving onto the dock pad posts the requisition');
  await page.screenshot({ path: 'scripts/depot-desktop.png' });

  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(900);
  await page.keyboard.up('ArrowDown');
  assert(true, 'reversing off the pad does not throw');

  console.log('\nsequencing rules');
  await openSimulator(page);

  // Out-of-order posting must be refused.
  await step(page, 'Goods Receipt');
  text = await ledgerText(page);
  assert(
    /No purchase order found/i.test(text),
    'goods receipt before PO is blocked with a domain-accurate reason'
  );
  assert(!/5000000456/.test(text), 'no material document was created');

  // Happy path.
  await step(page, 'Purchase Requisition');
  await step(page, 'Purchase Order');
  await step(page, 'Goods Receipt');
  text = await ledgerText(page);
  assert(/10004521/.test(text), 'requisition posted');
  assert(/4500000123/.test(text), 'purchase order posted');
  assert(/5000000456/.test(text), 'material document posted');
  assert(/101/.test(text), 'goods receipt carries movement type 101');

  await step(page, 'Invoice Verification');
  text = await ledgerText(page);
  assert(/Cleared for payment/i.test(text), 'three-way match clears when price agrees');

  await step(page, 'Outgoing Payment');
  text = await ledgerText(page);
  assert(/1500000089/.test(text), 'payment posted after a clean match');

  console.log('\nvariance path');
  await page.getByRole('dialog').getByLabel(/Inject price variance/i).check();
  text = await ledgerText(page);
  assert(!/1500000089/.test(text), 'toggling variance resets the ledger');

  await step(page, 'Purchase Requisition');
  await step(page, 'Purchase Order');
  await step(page, 'Goods Receipt');
  await step(page, 'Invoice Verification');
  text = await ledgerText(page);
  assert(/Price variance/i.test(text), 'variance is detected against the PO price');

  await step(page, 'Outgoing Payment');
  text = await ledgerText(page);
  assert(!/1500000089/.test(text), 'payment is blocked while the invoice has a variance');

  console.log('\nO2C branch');
  await step(page, 'Sales Order');
  await step(page, 'Outbound Delivery');
  await step(page, 'Goods Issue');
  await step(page, 'Billing Document');
  text = await ledgerText(page);
  assert(/0090001234/.test(text), 'billing document posted at the end of O2C');
  assert(/601/.test(text), 'goods issue carries movement type 601');

  await page.screenshot({ path: 'scripts/simulator-desktop.png' });

  console.log('\nmobile layout');
  await page.setViewportSize({ width: 390, height: 844 });
  await openSimulator(page);
  const box = await page.locator('[role="dialog"]').boundingBox();
  assert(box && box.width >= 320, `dialog is usable on mobile (${Math.round(box.width)}px)`);
  await page.screenshot({ path: 'scripts/simulator-mobile.png' });

  console.log('\nAll simulator tests passed.');
  await browser.close();
}

main().catch((err) => {
  console.error(`\nFAILED: ${err.message}`);
  process.exit(1);
});
