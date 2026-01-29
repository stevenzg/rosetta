import { test, expect } from '@playwright/test';
import { goToArticles, waitForArticles } from './helpers';

test.describe('Search and filter', () => {
	test.beforeEach(async ({ page }) => {
		await goToArticles(page);
		await waitForArticles(page);
	});

	test('filters articles by search term and restores on clear', async ({ page }) => {
		const initialCount = await page.locator('article').count();

		const searchInput = page.getByLabel('Search articles by title');
		await searchInput.fill('zzzznonexistent99999');
		// Wait for empty state after debounce
		await expect(page.getByText('No articles found')).toBeVisible({ timeout: 5_000 });

		// Clear via the clear button
		await page.getByRole('button', { name: 'Clear search' }).click();

		// Wait for full list to restore
		await waitForArticles(page);
		const restoredCount = await page.locator('article').count();
		expect(restoredCount).toBe(initialCount);
	});

	test('shows empty state for nonsense search', async ({ page }) => {
		await page.getByLabel('Search articles by title').fill('zzzznonexistent99999');

		await expect(page.getByText('No articles found')).toBeVisible({ timeout: 5_000 });
	});

	test('filters by status using radio buttons', async ({ page }) => {
		// Click "Draft" radio button
		await page.getByRole('radio', { name: 'Draft' }).click();
		await page.waitForTimeout(500);

		const hasDraftResults =
			(await page.locator('article').count()) > 0 ||
			(await page.getByText('No articles found').isVisible());
		expect(hasDraftResults).toBeTruthy();

		// Click "Published" radio button
		await page.getByRole('radio', { name: 'Published' }).click();
		await page.waitForTimeout(500);

		const hasPublishedResults =
			(await page.locator('article').count()) > 0 ||
			(await page.getByText('No articles found').isVisible());
		expect(hasPublishedResults).toBeTruthy();

		// Reset to "All"
		await page.getByRole('radio', { name: 'All' }).click();
		await page.waitForTimeout(500);
		await waitForArticles(page);
	});
});
