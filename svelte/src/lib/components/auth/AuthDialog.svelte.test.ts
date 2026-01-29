import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import AuthDialog from './AuthDialog.svelte';

const mockSignIn = vi.fn().mockResolvedValue({ error: null });
const mockSignUp = vi.fn().mockResolvedValue({ error: null });

vi.mock('$lib/supabase/client', () => ({
	getClient: vi.fn(() => ({
		auth: {
			signInWithPassword: mockSignIn,
			signUp: mockSignUp
		}
	}))
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

function renderOpen(props: Record<string, unknown> = {}) {
	return render(AuthDialog, {
		props: {
			open: true,
			onOpenChange: vi.fn(),
			...props
		}
	});
}

async function fillRegisterForm(email: string, password: string, confirmPassword: string) {
	await page.getByLabelText('Email').fill(email);
	await page.getByPlaceholder('At least 6 characters').fill(password);
	await page.getByLabelText('Confirm Password').fill(confirmPassword);
}

describe('AuthDialog', () => {
	it('does not show dialog when closed', async () => {
		expect.assertions(1);
		render(AuthDialog, {
			props: { open: false, onOpenChange: vi.fn() }
		});

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('renders login form by default', async () => {
		expect.assertions(3);
		renderOpen();

		await expect.element(page.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
		await expect.element(page.getByLabelText('Email')).toBeInTheDocument();
		await expect.element(page.getByLabelText('Password')).toBeInTheDocument();
	});

	it('renders register form when defaultMode is register', async () => {
		expect.assertions(2);
		renderOpen({ defaultMode: 'register' });

		await expect.element(page.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
		await expect.element(page.getByLabelText('Confirm Password')).toBeInTheDocument();
	});

	it('switches from login to register mode', async () => {
		expect.assertions(2);
		renderOpen({ defaultMode: 'login' });

		// Click the "Sign Up" link button (not the submit button)
		await page.getByText('Sign Up', { exact: true }).click();

		await expect.element(page.getByLabelText('Confirm Password')).toBeInTheDocument();
		await expect.element(page.getByText('Create an account to get started')).toBeInTheDocument();
	});

	it('switches from register to login mode', async () => {
		expect.assertions(1);
		renderOpen({ defaultMode: 'register' });

		await page.getByText('Sign In', { exact: true }).click();

		await expect.element(page.getByLabelText('Confirm Password')).not.toBeInTheDocument();
	});

	// --- Login validation ---

	it('shows error when login submitted with empty fields', async () => {
		expect.assertions(1);
		renderOpen({ defaultMode: 'login' });

		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect
			.element(page.getByText('Please enter both email and password.'))
			.toBeInTheDocument();
	});

	it('shows error for invalid email format on login', async () => {
		expect.assertions(1);
		renderOpen({ defaultMode: 'login' });

		await page.getByLabelText('Email').fill('not-an-email');
		await page.getByLabelText('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect.element(page.getByText('Please enter a valid email address.')).toBeInTheDocument();
	});

	// --- Register validation ---

	it('shows error when register submitted with empty fields', async () => {
		expect.assertions(1);
		renderOpen({ defaultMode: 'register' });

		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect.element(page.getByText('Please fill in all fields.')).toBeInTheDocument();
	});

	it('shows error for invalid email on register', async () => {
		expect.assertions(1);
		renderOpen({ defaultMode: 'register' });

		await fillRegisterForm('bad-email', 'password123', 'password123');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect.element(page.getByText('Please enter a valid email address.')).toBeInTheDocument();
	});

	it('shows error when passwords do not match on register', async () => {
		expect.assertions(1);
		renderOpen({ defaultMode: 'register' });

		await fillRegisterForm('user@example.com', 'password123', 'different');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect.element(page.getByText('Passwords do not match.')).toBeInTheDocument();
	});

	it('shows error when password is too short on register', async () => {
		expect.assertions(1);
		renderOpen({ defaultMode: 'register' });

		await fillRegisterForm('user@example.com', '12345', '12345');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect
			.element(page.getByText('Password must be at least 6 characters.'))
			.toBeInTheDocument();
	});

	// --- Successful register ---

	it('shows success message after valid registration', async () => {
		expect.assertions(1);
		mockSignUp.mockResolvedValueOnce({ error: null });
		renderOpen({ defaultMode: 'register' });

		await fillRegisterForm('user@example.com', 'password123', 'password123');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect
			.element(page.getByText('Check your email for a confirmation link'))
			.toBeInTheDocument();
	});

	// --- Auth error handling ---

	it('displays server auth error on login failure', async () => {
		expect.assertions(1);
		mockSignIn.mockResolvedValueOnce({
			error: { message: 'Invalid login credentials' }
		});

		renderOpen({ defaultMode: 'login' });

		await page.getByLabelText('Email').fill('user@example.com');
		await page.getByLabelText('Password').fill('wrongpassword');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect.element(page.getByText('Invalid login credentials')).toBeInTheDocument();
	});

	it('displays server auth error on register failure', async () => {
		expect.assertions(1);
		mockSignUp.mockResolvedValueOnce({
			error: { message: 'User already registered' }
		});

		renderOpen({ defaultMode: 'register' });

		await fillRegisterForm('user@example.com', 'password123', 'password123');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect.element(page.getByText('User already registered')).toBeInTheDocument();
	});

	// --- Mode switch resets state ---

	it('clears error when switching modes', async () => {
		expect.assertions(2);
		renderOpen({ defaultMode: 'login' });

		// Trigger a validation error
		await page.getByRole('button', { name: 'Sign In' }).click();
		await expect
			.element(page.getByText('Please enter both email and password.'))
			.toBeInTheDocument();

		// Switch to register mode — error should be cleared
		await page.getByText('Sign Up', { exact: true }).click();
		await expect
			.element(page.getByText('Please enter both email and password.'))
			.not.toBeInTheDocument();
	});
});
