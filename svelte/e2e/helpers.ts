/**
 * Shared helpers for Playwright e2e tests.
 *
 * These helpers assume two test accounts exist in the Supabase instance:
 *   - editor@test.local  (role: 'editor')
 *   - viewer@test.local  (role: 'viewer')
 *
 * In CI the accounts should be provisioned via globalSetup or seed scripts.
 */
import { type Page, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

export const TEST_EDITOR = {
	email: 'editor@test.local',
	password: 'test-editor-password'
};

export const TEST_VIEWER = {
	email: 'viewer@test.local',
	password: 'test-viewer-password'
};

/** Log in via the auth dialog and wait for it to close. */
export async function login(page: Page, credentials: { email: string; password: string }) {
	await page.goto(`${BASE_URL}/`);
	// Open the sign-in dialog from the header
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByLabel('Email').fill(credentials.email);
	await page.getByLabel('Password').fill(credentials.password);
	await page.getByRole('button', { name: 'Sign In' }).click();
	// Wait for dialog to close after successful login
	await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });
}

/** Navigate to the articles list page (assumes already authenticated). */
export async function goToArticles(page: Page) {
	await page.goto(`${BASE_URL}/`);
	await page.waitForLoadState('networkidle');
}

/** Wait for the article table to be visible. */
export async function waitForArticleTable(page: Page) {
	await expect(page.getByRole('table', { name: 'Articles' })).toBeVisible({ timeout: 10_000 });
}

/** Create an article via the UI (assumes user is an editor on home page). */
export async function createArticleViaUI(
	page: Page,
	data: { title: string; content?: string; status?: 'draft' | 'published' }
) {
	await page.getByRole('button', { name: 'Create Article' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();

	await page.getByLabel('Title').fill(data.title);
	if (data.content) {
		await page.getByLabel('Content').fill(data.content);
	}
	if (data.status) {
		await page.getByLabel('Status').selectOption(data.status);
	}

	await page.getByRole('button', { name: 'Create article' }).click();
	// Dialog should close on success
	await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });
}
