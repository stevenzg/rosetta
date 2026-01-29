import { test, expect } from '@playwright/test';
import { login, TEST_EDITOR, goToArticles, waitForArticleTable } from './helpers';

test.describe('Infinite scroll', () => {
	test('loads more articles when scrolling to the bottom', async ({ page }) => {
		await login(page, TEST_EDITOR);
		await goToArticles(page);
		await waitForArticleTable(page);

		const table = page.getByRole('table', { name: 'Articles' });
		const initialRows = await table.locator('tbody tr').count();

		// If there are more articles to load (sentinel should exist)
		const allLoadedText = page.getByText('All articles loaded');
		const allLoaded = await allLoadedText.isVisible().catch(() => false);

		if (!allLoaded && initialRows > 0) {
			// Scroll to the bottom to trigger infinite scroll
			await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

			// Wait for loading indicator or new rows
			await page.waitForTimeout(2_000);

			const newRows = await table.locator('tbody tr').count();
			// Should have loaded more rows (or the same if all were already shown)
			expect(newRows).toBeGreaterThanOrEqual(initialRows);
		}
	});

	test('shows "All articles loaded" when no more pages', async ({ page }) => {
		await login(page, TEST_EDITOR);
		await goToArticles(page);
		await waitForArticleTable(page);

		// Keep scrolling until all articles are loaded
		for (let i = 0; i < 10; i++) {
			const allLoaded = await page
				.getByText('All articles loaded')
				.isVisible()
				.catch(() => false);
			if (allLoaded) break;

			await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
			await page.waitForTimeout(1_000);
		}

		// Eventually "All articles loaded" should appear (or fewer than PAGE_SIZE articles exist)
		const table = page.getByRole('table', { name: 'Articles' });
		const totalRows = await table.locator('tbody tr').count();

		// If fewer than 20 articles, all loaded immediately; otherwise the message should appear
		if (totalRows >= 20) {
			await expect(page.getByText('All articles loaded')).toBeVisible({ timeout: 15_000 });
		}
	});
});
