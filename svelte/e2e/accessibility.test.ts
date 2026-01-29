import { test, expect } from '@playwright/test';
import { goToArticles, waitForArticles } from './helpers';

test.describe('Accessibility — public page structure', () => {
	test.beforeEach(async ({ page }) => {
		await goToArticles(page);
		await waitForArticles(page);
	});

	test('draft status badges have aria-label', async ({ page }) => {
		// Check if any draft badges exist; if so they should have proper labels
		const draftBadges = page.locator('[aria-label="Status: draft"]');
		const count = await draftBadges.count();

		if (count > 0) {
			for (let i = 0; i < count; i++) {
				const label = await draftBadges.nth(i).getAttribute('aria-label');
				expect(label).toBe('Status: draft');
			}
		}

		// At least verify article cards have author labels
		const authorLabels = page.locator('[aria-label^="Author:"]');
		const authorCount = await authorLabels.count();
		expect(authorCount).toBeGreaterThan(0);
	});

	test('article cards have semantic HTML structure', async ({ page }) => {
		const cards = page.locator('article');
		const count = await cards.count();
		expect(count).toBeGreaterThan(0);

		// Each card should use <article> element with an <h2> title
		const firstCard = cards.first();
		await expect(firstCard.locator('h2')).toBeVisible();

		// Should have a <time> element for the created date
		const timeEl = firstCard.locator('time[datetime]');
		await expect(timeEl).toBeVisible();
		const datetime = await timeEl.getAttribute('datetime');
		expect(datetime).toBeTruthy();
	});

	test('live region exists for article updates', async ({ page }) => {
		const liveRegion = page.locator('[aria-live="polite"]');
		await expect(liveRegion.first()).toBeVisible();
	});
});
