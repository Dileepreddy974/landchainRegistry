import { expect, test } from '@playwright/test';

async function chooseProfile(page: import('@playwright/test').Page, profile: 'OWNER' | 'REGISTRAR' | 'BANK' | 'COURT') {
  if (profile === 'OWNER') await page.getByRole('button', { name: /Register and manage your title/ }).click();
  if (profile === 'REGISTRAR') await page.getByRole('button', { name: /Verify and issue digital titles/ }).click();
  if (profile === 'BANK') await page.getByRole('button', { name: /Verify before you lend/ }).click();
  if (profile === 'COURT') await page.getByRole('button', { name: /Control disputed property/ }).click();
}

test('profile gate restricts each workspace', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ONE REGISTRY.FOUR DOORS.');
  await expect(page.getByRole('button', { name: /Register and manage your title/ })).toBeVisible();
  await page.screenshot({ path: info.outputPath('profile-gate.png'), fullPage: true });

  await chooseProfile(page, 'REGISTRAR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('VERIFY.THEN ISSUE.');
  await expect(page.getByRole('navigation', { name: 'LandChain sections' }).getByRole('button', { name: 'Verification queue' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'LandChain sections' }).getByRole('button', { name: 'Bank verification' })).toHaveCount(0);

  await page.getByLabel('Active profile').selectOption('BANK');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('CHECK BEFORE YOU LEND.');
  await expect(page.getByRole('navigation', { name: 'LandChain sections' }).getByRole('button', { name: 'Verification queue' })).toHaveCount(0);

  await page.getByLabel('Active profile').selectOption('COURT');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('WHEN THE LAW SAYS STOP.');
  await expect(page.getByRole('navigation', { name: 'LandChain sections' }).getByRole('button', { name: 'Disputes' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('owner submits a property and registrar issues the digital title', async ({ page }) => {
  await page.goto('/');
  await chooseProfile(page, 'OWNER');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('YOUR LAND.YOUR PROOF.');

  await page.getByLabel('LOCATION').fill('JUBILEE HILLS / HYDERABAD');
  await page.getByLabel('SURVEY NUMBER').fill('555/2');
  await page.getByLabel('AREA / SQ YARDS').fill('300');
  await page.getByRole('button', { name: 'CONTINUE' }).click();
  await page.locator('.document-upload input[type="file"]').setInputFiles({ name: 'sale-deed-5552.pdf', mimeType: 'application/pdf', buffer: Buffer.from('demo deed') });
  await page.getByRole('button', { name: 'CONTINUE' }).click();
  await expect(page.getByText('Ready for government review')).toBeVisible();
  await page.getByRole('button', { name: /SUBMIT FOR REVIEW/ }).click();
  await expect(page.getByText('PROPERTY SUBMITTED FOR GOVERNMENT VERIFICATION')).toBeVisible();
  await expect(page.getByText('APPLICATION PENDING')).toBeVisible();

  await page.getByLabel('Active profile').selectOption('REGISTRAR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('VERIFY.THEN ISSUE.');
  await expect(page.getByRole('heading', { name: /TS-HYD-/ })).toHaveCount(1);
  await page.getByRole('button', { name: /APPROVE \+ ISSUE TITLE/ }).click();
  await expect(page.getByText('REGISTRATION APPROVED / DIGITAL TITLE ISSUED')).toBeVisible();
});

test('registrar document integrity demo works', async ({ page }) => {
  await page.goto('/');
  await chooseProfile(page, 'REGISTRAR');
  await page.getByRole('navigation', { name: 'LandChain sections' }).getByRole('button', { name: 'Document verification' }).click();
  await expect(page.locator('.hash-row code').first()).not.toHaveText('CALCULATING...');
  await expect(page.locator('.integrity-result')).toContainText('DOCUMENT INTEGRITY VERIFIED');
  const originalHash = await page.locator('.hash-row code').first().getAttribute('title');
  expect(originalHash).toMatch(/^[a-f0-9]{64}$/);

  await page.getByRole('button', { name: 'SIMULATE DOCUMENT EDIT' }).click();
  await expect(page.locator('.integrity-result')).toContainText('DOCUMENT TAMPER DETECTED');
  expect(await page.locator('.hash-row code').last().getAttribute('title')).not.toEqual(originalHash);

  await page.getByRole('button', { name: 'RESTORE ORIGINAL DOCUMENT' }).click();
  await expect(page.locator('.integrity-result')).toContainText('DOCUMENT INTEGRITY VERIFIED');
  expect(await page.locator('.hash-row code').last().getAttribute('title')).toEqual(originalHash);
});
