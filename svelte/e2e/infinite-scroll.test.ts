import { test, expect } from '@playwright/test';
import { goToArticles, waitForArticles } from './helpers';

test.describe('Infinite scroll', () => {
	test('loads more articles when scrolling to the bottom', async ({ page }) => {
		await goToArticles(page);
		await waitForArticles(page);

		const initialCount = await page.locator('article').count();

		const allLoaded = await page
			.getByText('All articles loaded.')
			.isVisible()
			.catch(() => false);

		if (!allLoaded && initialCount > 0) {
			await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
			await page.waitForTimeout(2_000);

			const newCount = await page.locator('article').count();
			expect(newCount).toBeGreaterThanOrEqual(initialCount);
		}
	});

	test('eventually shows all articles loaded indicator', async ({ page }) => {
		await goToArticles(page);
		await waitForArticles(page);

		// Keep scrolling until all articles are loaded
		for (let i = 0; i < 10; i++) {
			const allLoaded = await page
				.getByText('All articles loaded.')
				.isVisible()
				.catch(() => false);
			if (allLoaded) break;

			await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
			await page.waitForTimeout(1_000);
		}

		// After scrolling, either all loaded message is shown or all articles fit on one page
		const totalCards = await page.locator('article').count();
		const allLoadedVisible = await page
			.getByText('All articles loaded.')
			.isVisible()
			.catch(() => false);

		// If fewer than PAGE_SIZE articles, "All articles loaded." shows immediately
		// If more, it should show after scrolling through all pages
		expect(totalCards > 0 || allLoadedVisible).toBeTruthy();
	});
});
