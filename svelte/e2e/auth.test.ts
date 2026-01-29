import { test, expect } from '@playwright/test';

test.describe('Public access', () => {
	test('unauthenticated user can view articles on home page', async ({ page }) => {
		await page.goto('http://localhost:4173/');
		// Should stay on home page and see articles heading
		await expect(page.getByRole('heading', { name: 'Articles' })).toBeVisible({ timeout: 10_000 });
		// Sign in button should be in header
		await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
	});
});
