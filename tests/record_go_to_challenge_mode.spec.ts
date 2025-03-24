import { test } from './test-utils';
import { expect } from 'playwright/test';

test('test', async ({ page, cleanupStorage }) => {
  await page.goto('http://localhost:5173/#/play');
  await page.getByRole('link', { name: 'Challenge' }).click();
  await expect(page.locator('h2')).toContainText('Daily Challenge Rules');
});