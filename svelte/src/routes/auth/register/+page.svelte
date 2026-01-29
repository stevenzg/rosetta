<script lang="ts">
	import { createClient } from '$lib/supabase/client'
	import { goto, invalidateAll } from '$app/navigation'

	let displayName = $state('')
	let email = $state('')
	let password = $state('')
	let error = $state<string | null>(null)
	let loading = $state(false)
	let confirmationPending = $state(false)

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault()
		error = null
		loading = true

		const supabase = createClient()
		const { data: signUpData, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { display_name: displayName }
			}
		})

		if (authError) {
			error = authError.message
			loading = false
			return
		}

		// If email confirmation is required, the user will have an identities array
		// that is empty or the session will be null
		if (signUpData.user && !signUpData.session) {
			confirmationPending = true
			loading = false
			return
		}

		await invalidateAll()
		await goto('/articles')
	}
</script>

<div class="mx-auto max-w-sm py-20">
	<h1 class="mb-6 text-center text-2xl font-bold text-foreground">Create Account</h1>

	{#if confirmationPending}
		<div class="rounded-md bg-primary/10 p-4 text-center text-sm text-foreground" role="status">
			<p class="font-medium">Check your email</p>
			<p class="mt-1 text-muted-foreground">
				We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox and
				click the link to activate your account.
			</p>
		</div>
		<p class="mt-4 text-center text-sm text-muted-foreground">
			Already confirmed?
			<a href="/auth/login" class="text-foreground underline hover:no-underline">Sign in</a>
		</p>
	{:else}
		{#if error}
			<div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
				{error}
			</div>
		{/if}

		<form onsubmit={handleRegister} class="space-y-4">
			<div>
				<label for="displayName" class="mb-1 block text-sm font-medium text-foreground">
					Display Name
				</label>
				<input
					id="displayName"
					type="text"
					bind:value={displayName}
					required
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
					placeholder="Your name"
				/>
			</div>

			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-foreground">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-foreground">
					Password
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength="6"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
					placeholder="At least 6 characters"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
			>
				{loading ? 'Creating account...' : 'Create account'}
			</button>
		</form>

		<p class="mt-4 text-center text-sm text-muted-foreground">
			Already have an account?
			<a href="/auth/login" class="text-foreground underline hover:no-underline">Sign in</a>
		</p>
	{/if}
</div>
