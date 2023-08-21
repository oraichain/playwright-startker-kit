import { Page } from '@playwright/test';
import { test, expect } from './fixtures';

test.beforeEach(async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
});

test('reject swap', async ({ page, extensionId, context }) => {
  await page.goto('https://oraidex.io/universalswap');
  let extensionPage: Page;
  try {
    extensionPage = await context.waitForEvent('page', { timeout: 2000 });
    if (extensionPage) {
      await extensionPage.getByPlaceholder('Enter your account password').fill(process.env.PASSWORD!);
      await extensionPage.getByRole('button', { name: 'Unlock' }).click();
    }
  } catch {}

  await page.locator('.InputSwap_amount__N6dau').first().fill('0.001');
  await page.getByRole('button', { name: 'Swap' }).click();

  // wait for popup page to open
  extensionPage = await context.waitForEvent('page');
  expect(extensionPage.url().includes(extensionId) === true);

  const rejectBtn = extensionPage.getByRole('button', { name: 'Reject' });
  await rejectBtn.scrollIntoViewIfNeeded();

  await new Promise((r) => setTimeout(r, 2000));

  // reject
  await rejectBtn.click();

  await page.close();
});
