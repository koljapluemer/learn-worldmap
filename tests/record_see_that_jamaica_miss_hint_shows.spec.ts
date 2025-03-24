import { test, expect } from 'playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/#/play');
  await page.getByRole('img').click();
  await expect(page.locator('#app')).toContainText('Jamaica is here, try again.');
});