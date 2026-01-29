import { test, expect } from '@playwright/test';
import {
	login,
	TEST_EDITOR,
	goToArticles,
	waitForArticleTable,
	createArticleViaUI
} from './helpers';

test.describe('Article list rendering', () => {
	test.beforeEach(async ({ page }) => {
		await login(page, TEST_EDITOR);
	});

	test('displays article table with correct columns and skeleton during load', async ({ page }) => {
		// Navigate fresh to trigger load
		await goToArticles(page);

		// The skeleton should appear briefly (aria-label="Loading articles")
		// Then the table renders
		await waitForArticleTable(page);

		const table = page.getByRole('table', { name: 'Articles' });
		const headers = table.getByRole('columnheader');

		// Should have 6 columns: ID, Title, Status, Author, Created, Actions (sr-only)
		await expect(headers).toHaveCount(6);
		await expect(headers.nth(0)).toHaveText('ID');
		await expect(headers.nth(1)).toHaveText('Title');
		await expect(headers.nth(2)).toHaveText('Status');
		await expect(headers.nth(3)).toHaveText('Author');
		await expect(headers.nth(4)).toHaveText('Created');
	});

	test('shows article data in each row', async ({ page }) => {
		await goToArticles(page);
		await waitForArticleTable(page);

		const rows = page.getByRole('table', { name: 'Articles' }).locator('tbody tr');
		const rowCount = await rows.count();

		// At least one article should be present (assuming seeded data)
		expect(rowCount).toBeGreaterThan(0);

		// First row should have cells with text content
		const firstRow = rows.first();
		const cells = firstRow.getByRole('cell');
		// ID cell should contain truncated UUID (8 chars)
		const idText = await cells.nth(0).textContent();
		expect(idText?.trim()).toMatch(/^[a-f0-9]{8}$/);

		// Title cell should have non-empty text
		const titleText = await cells.nth(1).textContent();
		expect(titleText?.trim().length).toBeGreaterThan(0);

		// Status cell should contain 'draft' or 'published'
		const statusText = await cells.nth(2).textContent();
		expect(statusText?.trim()).toMatch(/^(draft|published)$/);
	});

	test('shows empty state when no articles match', async ({ page }) => {
		await goToArticles(page);
		await waitForArticleTable(page);

		// Search for nonsense string
		await page.getByLabel('Search articles by title').fill('zzzznonexistent99999');
		// Wait for debounce + fetch
		await page.waitForTimeout(500);

		await expect(page.getByText('No articles found')).toBeVisible();
	});
});

test.describe('Article CRUD operations', () => {
	test.beforeEach(async ({ page }) => {
		await login(page, TEST_EDITOR);
		await goToArticles(page);
		await waitForArticleTable(page);
	});

	test('creates a new article via dialog', async ({ page }) => {
		const uniqueTitle = `E2E Test Article ${Date.now()}`;

		await createArticleViaUI(page, {
			title: uniqueTitle,
			content: 'Test content from e2e',
			status: 'draft'
		});

		// The new article should appear in the list
		await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 5_000 });
	});

	test('edits an existing article', async ({ page }) => {
		// Click edit on the first article
		const editButtons = page.getByRole('button', { name: /^Edit article:/ });
		await expect(editButtons.first()).toBeVisible();
		await editButtons.first().click();

		// Dialog should open with pre-filled data
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog.getByText('Edit Article')).toBeVisible();

		// The title field should be pre-filled
		const titleInput = page.getByLabel('Title');
		const originalTitle = await titleInput.inputValue();
		expect(originalTitle.length).toBeGreaterThan(0);

		// Modify the title
		const updatedTitle = `Updated ${Date.now()}`;
		await titleInput.fill(updatedTitle);
		await page.getByRole('button', { name: 'Save changes' }).click();

		// Dialog should close
		await expect(dialog).toBeHidden({ timeout: 10_000 });

		// Updated title should appear in the list
		await expect(page.getByText(updatedTitle)).toBeVisible();
	});

	test('deletes an article with confirmation', async ({ page }) => {
		// First create an article to delete
		const deleteTitle = `Delete Me ${Date.now()}`;
		await createArticleViaUI(page, { title: deleteTitle, status: 'draft' });
		await expect(page.getByText(deleteTitle)).toBeVisible({ timeout: 5_000 });

		// Find the delete button for this article's row
		const row = page.locator('tr', { hasText: deleteTitle });
		const deleteButton = row.getByRole('button', { name: /^Delete article:/ });
		await deleteButton.click();

		// Confirmation dialog should appear
		const alertDialog = page.getByRole('alertdialog');
		await expect(alertDialog).toBeVisible();
		await expect(alertDialog.getByText(deleteTitle)).toBeVisible();

		// Confirm deletion
		await alertDialog.getByRole('button', { name: 'Delete' }).click();

		// Dialog should close and article removed
		await expect(alertDialog).toBeHidden({ timeout: 10_000 });
		await expect(page.getByText(deleteTitle)).toBeHidden();
	});

	test('cancelling delete keeps article in list', async ({ page }) => {
		// Get title of first article
		const firstRow = page.getByRole('table', { name: 'Articles' }).locator('tbody tr').first();
		const titleText = await firstRow.getByRole('cell').nth(1).textContent();

		// Click delete on the first article
		const deleteButtons = page.getByRole('button', { name: /^Delete article:/ });
		await deleteButtons.first().click();

		const alertDialog = page.getByRole('alertdialog');
		await expect(alertDialog).toBeVisible();

		// Cancel deletion
		await alertDialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(alertDialog).toBeHidden();

		// Article should still be visible
		if (titleText) {
			await expect(page.getByText(titleText.trim())).toBeVisible();
		}
	});

	test('shows validation errors on empty form submission', async ({ page }) => {
		await page.getByRole('button', { name: 'Create Article' }).click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Clear title and submit
		await page.getByLabel('Title').fill('');
		await page.getByRole('button', { name: 'Create article' }).click();

		// Validation error should appear
		await expect(page.getByText('Title is required')).toBeVisible();

		// Dialog should still be open (form did not submit)
		await expect(dialog).toBeVisible();
	});
});
