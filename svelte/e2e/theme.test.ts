import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
	test('toggles between light and dark theme and persists on reload', async ({ page }) => {
		await page.goto('http://localhost:4173/');
		await expect(page.getByRole('heading', { name: 'Articles' })).toBeVisible({ timeout: 10_000 });

		// Check initial theme state
		const html = page.locator('html');
		const initiallyDark = await html.evaluate((el) => el.classList.contains('dark'));

		// Find and click the theme toggle button
		const themeToggle = page.getByRole('button', { name: /Switch to (dark|light) mode/i });
		await expect(themeToggle).toBeVisible();
		await themeToggle.click();

		// Theme should have toggled
		const nowDark = await html.evaluate((el) => el.classList.contains('dark'));
		expect(nowDark).toBe(!initiallyDark);

		// Reload the page — theme should persist via localStorage
		await page.reload();
		await page.waitForLoadState('domcontentloaded');
		const afterReloadDark = await html.evaluate((el) => el.classList.contains('dark'));
		expect(afterReloadDark).toBe(!initiallyDark);

		// Toggle back to restore original theme
		const themeToggle2 = page.getByRole('button', { name: /Switch to (dark|light) mode/i });
		await themeToggle2.click();
		const restoredDark = await html.evaluate((el) => el.classList.contains('dark'));
		expect(restoredDark).toBe(initiallyDark);
	});
});
