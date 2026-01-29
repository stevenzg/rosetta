import { test, expect } from '@playwright/test';
import { goToArticles, waitForArticles } from './helpers';

test.describe('Article list rendering', () => {
	test('displays article cards with title and metadata', async ({ page }) => {
		await goToArticles(page);
		await waitForArticles(page);

		const cards = page.locator('article');
		const count = await cards.count();
		expect(count).toBeGreaterThan(0);

		// First card should have a title (h2) and author info
		const firstCard = cards.first();
		const title = firstCard.locator('h2');
		await expect(title).toBeVisible();
		const titleText = await title.textContent();
		expect(titleText?.trim().length).toBeGreaterThan(0);

		// Should show author name
		const author = firstCard.locator('[aria-label^="Author:"]');
		await expect(author).toBeVisible();

		// Should show created date
		const time = firstCard.locator('time');
		await expect(time).toBeVisible();
	});

	test('shows empty state when no articles match', async ({ page }) => {
		await goToArticles(page);
		await waitForArticles(page);

		// Search for nonsense string
		await page.getByLabel('Search articles by title').fill('zzzznonexistent99999');

		await expect(page.getByText('No articles found')).toBeVisible({ timeout: 5_000 });
	});
});
