<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import Header from '$lib/components/layout/Header.svelte'

	let { data, children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Rosetta</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header session={data.session} profile={data.profile} />
	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
		{@render children()}
	</main>
</div>
