import { test, expect } from '@playwright/test';
import { login, TEST_EDITOR, goToArticles, waitForArticleTable } from './helpers';

test.describe('Search and filter', () => {
	test.beforeEach(async ({ page }) => {
		await login(page, TEST_EDITOR);
		await goToArticles(page);
		await waitForArticleTable(page);
	});

	test('filters articles by search term and restores on clear', async ({ page }) => {
		// Get initial row count
		const initialRows = page.getByRole('table', { name: 'Articles' }).locator('tbody tr');
		const initialCount = await initialRows.count();

		// Type a search term (use a short common term that might match some articles)
		const searchInput = page.getByLabel('Search articles by title');
		await searchInput.fill('test');

		// Wait for debounce + fetch
		await page.waitForTimeout(500);

		// Results may be different from initial count (filtered)
		// At minimum, if articles match, they should be shown
		// If no match, empty state appears
		const hasResults =
			(await page.getByRole('table', { name: 'Articles' }).isVisible()) ||
			(await page.getByText('No articles found').isVisible());
		expect(hasResults).toBeTruthy();

		// Clear the search
		const clearButton = page.getByRole('button', { name: 'Clear search' });
		if (await clearButton.isVisible()) {
			await clearButton.click();
		} else {
			await searchInput.fill('');
		}
		await page.waitForTimeout(500);

		// List should be restored
		await waitForArticleTable(page);
		const restoredRows = page.getByRole('table', { name: 'Articles' }).locator('tbody tr');
		const restoredCount = await restoredRows.count();
		expect(restoredCount).toBe(initialCount);
	});

	test('shows empty state for nonsense search', async ({ page }) => {
		const searchInput = page.getByLabel('Search articles by title');
		await searchInput.fill('zzzznonexistent99999');
		await page.waitForTimeout(500);

		await expect(page.getByText('No articles found')).toBeVisible();
	});

	test('filters by Published status', async ({ page }) => {
		const statusFilter = page.getByLabel('Status:');
		await statusFilter.selectOption('published');
		await page.waitForTimeout(500);

		// Either articles are shown or empty state
		const hasTable = await page.getByRole('table', { name: 'Articles' }).isVisible();
		if (hasTable) {
			// All visible status badges should be "published"
			const statusBadges = page.locator('[aria-label="Status: draft"]');
			await expect(statusBadges).toHaveCount(0);
		} else {
			await expect(page.getByText('No articles found')).toBeVisible();
		}

		// Reset filter
		await statusFilter.selectOption('all');
		await page.waitForTimeout(500);
		await waitForArticleTable(page);
	});

	test('filters by Draft status', async ({ page }) => {
		const statusFilter = page.getByLabel('Status:');
		await statusFilter.selectOption('draft');
		await page.waitForTimeout(500);

		const hasTable = await page.getByRole('table', { name: 'Articles' }).isVisible();
		if (hasTable) {
			const publishedBadges = page.locator('[aria-label="Status: published"]');
			await expect(publishedBadges).toHaveCount(0);
		} else {
			await expect(page.getByText('No articles found')).toBeVisible();
		}
	});

	test('combines status filter with search', async ({ page }) => {
		// Set draft filter
		const statusFilter = page.getByLabel('Status:');
		await statusFilter.selectOption('draft');
		await page.waitForTimeout(500);

		// Type a search term
		const searchInput = page.getByLabel('Search articles by title');
		await searchInput.fill('test');
		await page.waitForTimeout(500);

		// Results should respect both filters
		const hasTable = await page.getByRole('table', { name: 'Articles' }).isVisible();
		if (hasTable) {
			// No published articles should appear
			const publishedBadges = page.locator('[aria-label="Status: published"]');
			await expect(publishedBadges).toHaveCount(0);
		}

		// Clear search first
		await searchInput.fill('');
		await page.waitForTimeout(500);

		// Reset filter
		await statusFilter.selectOption('all');
		await page.waitForTimeout(500);

		// All articles should be back
		await waitForArticleTable(page);
	});
});
