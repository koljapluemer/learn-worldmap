
test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/#/play');
  await page.locator('path:nth-child(9)').click();
  await expect(page.locator('#app')).toContainText('Place the red circle so that it touches Cayman Is.');
});