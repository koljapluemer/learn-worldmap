// tests/playwright.spec.ts
import { test } from './test-utils';
import { expect } from 'playwright/test';

test('app starts and displays expected content', async ({ page, cleanupStorage }) => {
  // Navigate to your app's URL (adjust the port if needed)
  await page.goto('http://localhost:5173');

  // Check that the app loaded by verifying that an <h1> element is visible
  const header = page.locator('h1');
  await expect(header).toBeVisible();
});
