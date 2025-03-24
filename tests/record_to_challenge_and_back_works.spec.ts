import { test, expect } from 'playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/#/play');
  await page.getByRole('link', { name: 'Challenge' }).click();
  await page.getByRole('button', { name: 'Practice' }).click();
  await expect(page.locator('#app')).toContainText('Place the red circle so that it touches Jamaica');
});