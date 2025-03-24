import { test, expect } from 'playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/#/play');
  await page.getByRole('link', { name: 'Challenge' }).click();
  await expect(page.locator('h2')).toContainText('Daily Challenge Rules');
});