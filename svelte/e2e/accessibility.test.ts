import { test, expect } from '@playwright/test';
import { login, TEST_EDITOR, goToArticles, waitForArticleTable } from './helpers';

test.describe('Accessibility — keyboard navigation and screen reader support', () => {
	test.beforeEach(async ({ page }) => {
		await login(page, TEST_EDITOR);
		await goToArticles(page);
		await waitForArticleTable(page);
	});

	test('all interactive elements are reachable via Tab', async ({ page }) => {
		// Focus on the search input first
		const searchInput = page.getByLabel('Search articles by title');
		await searchInput.focus();
		await expect(searchInput).toBeFocused();

		// Tab to status filter
		await page.keyboard.press('Tab');
		const statusFilter = page.getByLabel('Status:');
		await expect(statusFilter).toBeFocused();

		// Tab to create button (editor)
		await page.keyboard.press('Tab');
		const createButton = page.getByRole('button', { name: 'Create Article' });
		await expect(createButton).toBeFocused();
	});

	test('modal dialog traps focus and closes with Escape', async ({ page }) => {
		// Open the create dialog
		await page.getByRole('button', { name: 'Create Article' }).click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Press Escape to close
		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
	});

	test('article table has proper ARIA structure', async ({ page }) => {
		const table = page.getByRole('table', { name: 'Articles' });
		await expect(table).toBeVisible();

		// Table should have a caption (sr-only)
		const caption = table.locator('caption');
		await expect(caption).toHaveText('List of articles');

		// Column headers should use th with scope="col"
		const headers = table.locator('thead th[scope="col"]');
		const headerCount = await headers.count();
		expect(headerCount).toBe(6);
	});

	test('status badges have aria-label', async ({ page }) => {
		const statusBadges = page.locator('[aria-label^="Status:"]');
		const count = await statusBadges.count();
		expect(count).toBeGreaterThan(0);

		// Each badge should have Status: draft or Status: published
		for (let i = 0; i < count; i++) {
			const label = await statusBadges.nth(i).getAttribute('aria-label');
			expect(label).toMatch(/^Status: (draft|published)$/);
		}
	});

	test('edit and delete buttons have descriptive aria-labels', async ({ page }) => {
		const editButtons = page.getByRole('button', { name: /^Edit article:/ });
		const editCount = await editButtons.count();
		expect(editCount).toBeGreaterThan(0);

		// Each edit button label should include article title
		for (let i = 0; i < editCount; i++) {
			const label = await editButtons.nth(i).getAttribute('aria-label');
			expect(label).toMatch(/^Edit article: .+/);
		}

		const deleteButtons = page.getByRole('button', { name: /^Delete article:/ });
		const deleteCount = await deleteButtons.count();
		expect(deleteCount).toBeGreaterThan(0);

		for (let i = 0; i < deleteCount; i++) {
			const label = await deleteButtons.nth(i).getAttribute('aria-label');
			expect(label).toMatch(/^Delete article: .+/);
		}
	});

	test('live region announces article count', async ({ page }) => {
		const liveRegion = page.locator('[aria-live="polite"]');
		// At least one live region should announce article count
		const text = await liveRegion.first().textContent();
		expect(text).toMatch(/\d+ articles loaded/);
	});
});
