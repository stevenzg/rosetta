<script lang="ts">
	import { getClient } from '$lib/supabase/client'
	import { invalidateAll } from '$app/navigation'

	type AuthMode = 'login' | 'register'

	interface Props {
		open: boolean
		defaultMode?: AuthMode
		onOpenChange: (open: boolean) => void
	}

	let { open = $bindable(), defaultMode = 'login', onOpenChange }: Props = $props()

	let mode = $state<AuthMode>(defaultMode)
	let email = $state('')
	let password = $state('')
	let confirmPassword = $state('')
	let error = $state<string | null>(null)
	let success = $state(false)
	let loading = $state(false)

	let dialogEl = $state<HTMLDialogElement | null>(null)

	function reset() {
		email = ''
		password = ''
		confirmPassword = ''
		error = null
		success = false
		loading = false
	}

	function switchMode(next: AuthMode) {
		reset()
		mode = next
	}

	function close() {
		reset()
		onOpenChange(false)
	}

	$effect(() => {
		if (open) {
			mode = defaultMode
			reset()
			dialogEl?.showModal()
		} else {
			dialogEl?.close()
		}
	})

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) {
			close()
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close()
		}
	}

	const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

	function validateBase(trimmedEmail: string): string | null {
		if (!trimmedEmail || !password) return 'Please enter both email and password.'
		if (!isValidEmail(trimmedEmail)) return 'Please enter a valid email address.'
		return null
	}

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault()
		error = null

		const trimmedEmail = email.trim()
		const validationError = validateBase(trimmedEmail)
		if (validationError) {
			error = validationError
			return
		}

		loading = true

		const supabase = getClient()
		const { error: authError } = await supabase.auth.signInWithPassword({
			email: trimmedEmail,
			password
		})

		if (authError) {
			error = authError.message
			loading = false
			return
		}

		close()
		await invalidateAll()
	}

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault()
		error = null

		const trimmedEmail = email.trim()
		if (!trimmedEmail || !password || !confirmPassword) {
			error = 'Please fill in all fields.'
			return
		}

		if (!isValidEmail(trimmedEmail)) {
			error = 'Please enter a valid email address.'
			return
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match.'
			return
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters.'
			return
		}

		loading = true

		const supabase = getClient()
		const { error: authError } = await supabase.auth.signUp({
			email: trimmedEmail,
			password
		})

		if (authError) {
			error = authError.message
			loading = false
			return
		}

		success = true
		loading = false
	}

	const isLogin = $derived(mode === 'login')
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialogEl}
	class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 w-full max-w-sm rounded-lg border bg-background p-0 shadow-lg backdrop:bg-black/50"
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	onclose={close}
>
	<div class="p-6">
		<div class="mb-4">
			<h2 class="text-lg font-semibold text-foreground">
				{isLogin ? 'Sign In' : 'Sign Up'}
			</h2>
			<p class="text-sm text-muted-foreground">
				{isLogin
					? 'Enter your credentials to access the dashboard'
					: 'Create an account to get started'}
			</p>
		</div>

		{#if success}
			<div class="space-y-4 text-center">
				<p class="text-sm text-muted-foreground">
					Check your email for a confirmation link to complete your registration.
				</p>
				<button
					type="button"
					class="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
					onclick={() => switchMode('login')}
				>
					Back to Sign In
				</button>
			</div>
		{:else}
			<form
				onsubmit={isLogin ? handleLogin : handleRegister}
				class="space-y-4"
				novalidate
			>
				<div class="space-y-2">
					<label for="auth-email" class="text-sm font-medium text-foreground">Email</label>
					<input
						id="auth-email"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						required
						autocomplete="email"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
					/>
				</div>

				<div class="space-y-2">
					<label for="auth-password" class="text-sm font-medium text-foreground">Password</label>
					<input
						id="auth-password"
						type="password"
						bind:value={password}
						placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
						required
						autocomplete={isLogin ? 'current-password' : 'new-password'}
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
					/>
				</div>

				{#if !isLogin}
					<div class="space-y-2">
						<label for="auth-confirm-password" class="text-sm font-medium text-foreground">
							Confirm Password
						</label>
						<input
							id="auth-confirm-password"
							type="password"
							bind:value={confirmPassword}
							placeholder="Repeat your password"
							required
							autocomplete="new-password"
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
						/>
					</div>
				{/if}

				{#if error}
					<p class="text-sm text-destructive" role="alert">{error}</p>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
				>
					{#if loading}
						{isLogin ? 'Signing in...' : 'Creating account...'}
					{:else}
						{isLogin ? 'Sign In' : 'Sign Up'}
					{/if}
				</button>
			</form>

			<p class="mt-4 text-center text-sm text-muted-foreground">
				{#if isLogin}
					Don't have an account?
					<button
						type="button"
						class="font-medium text-primary underline-offset-4 hover:underline"
						onclick={() => switchMode('register')}
					>
						Sign Up
					</button>
				{:else}
					Already have an account?
					<button
						type="button"
						class="font-medium text-primary underline-offset-4 hover:underline"
						onclick={() => switchMode('login')}
					>
						Sign In
					</button>
				{/if}
			</p>
		{/if}
	</div>
</dialog>
