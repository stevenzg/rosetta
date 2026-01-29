<script lang="ts">
	import { createClient } from '$lib/supabase/client'
	import { goto, invalidateAll } from '$app/navigation'

	let email = $state('')
	let password = $state('')
	let error = $state<string | null>(null)
	let loading = $state(false)

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault()
		error = null
		loading = true

		const supabase = createClient()
		const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

		if (authError) {
			error = authError.message
			loading = false
			return
		}

		await invalidateAll()
		await goto('/articles')
	}
</script>

<div class="mx-auto max-w-sm py-20">
	<h1 class="mb-6 text-center text-2xl font-bold text-foreground">Sign In</h1>

	{#if error}
		<div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
			{error}
		</div>
	{/if}

	<form onsubmit={handleLogin} class="space-y-4">
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
				placeholder="Your password"
			/>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
		>
			{loading ? 'Signing in...' : 'Sign in'}
		</button>
	</form>

	<p class="mt-4 text-center text-sm text-muted-foreground">
		Don't have an account?
		<a href="/auth/register" class="text-foreground underline hover:no-underline">Register</a>
	</p>
</div>
