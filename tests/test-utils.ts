import { test as base } from 'playwright/test';

// Extend the base test type with our custom fixtures
type TestFixtures = {
  cleanupStorage: void;
};

// Create a test fixture that handles cleanup
export const test = base.extend<TestFixtures>({
  cleanupStorage: async ({ page }, use) => {
    // Clean up before test by reloading the page
    await page.reload();
    
    // Run the test
    await use();
    
    // Clean up after test by reloading the page
    await page.reload();
  },
}); 