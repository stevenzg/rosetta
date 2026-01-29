import { test, expect } from '@playwright/test';
import { login, TEST_EDITOR, TEST_VIEWER, goToArticles, waitForArticleTable } from './helpers';

test.describe('Role-based access control', () => {
	test('viewer sees no CRUD buttons', async ({ page }) => {
		await login(page, TEST_VIEWER);
		await goToArticles(page);
		await waitForArticleTable(page);

		// No "Create Article" button
		await expect(page.getByRole('button', { name: 'Create Article' })).toBeHidden();

		// No edit/delete buttons in the table
		const editButtons = page.getByRole('button', { name: /^Edit article:/ });
		await expect(editButtons).toHaveCount(0);

		const deleteButtons = page.getByRole('button', { name: /^Delete article:/ });
		await expect(deleteButtons).toHaveCount(0);
	});

	test('editor sees all CRUD buttons', async ({ page }) => {
		await login(page, TEST_EDITOR);
		await goToArticles(page);
		await waitForArticleTable(page);

		// "Create Article" button should be visible
		await expect(page.getByRole('button', { name: 'Create Article' })).toBeVisible();

		// Edit and delete buttons should be present in article rows
		const editButtons = page.getByRole('button', { name: /^Edit article:/ });
		const editCount = await editButtons.count();
		expect(editCount).toBeGreaterThan(0);

		const deleteButtons = page.getByRole('button', { name: /^Delete article:/ });
		const deleteCount = await deleteButtons.count();
		expect(deleteCount).toBeGreaterThan(0);
	});

	test('unauthenticated user is redirected to login from /articles', async ({ page }) => {
		await page.goto('http://localhost:4173/articles');
		// Should redirect to login
		await page.waitForURL('**/auth/login', { timeout: 10_000 });
		await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
	});
});
