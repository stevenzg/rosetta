/**
 * Shared helpers for Playwright e2e tests.
 */
import { type Page, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

/** Navigate to the articles list page. */
export async function goToArticles(page: Page) {
	await page.goto(`${BASE_URL}/`);
	await page.waitForLoadState('networkidle');
}

/** Wait for the article list to be visible (at least one article card). */
export async function waitForArticles(page: Page) {
	await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });
}
