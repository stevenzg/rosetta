<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import Header from '$lib/components/layout/Header.svelte'
	import Footer from '$lib/components/layout/Footer.svelte'

	let { data, children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Rosetta</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<a
		href="#main-content"
		class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
	>
		Skip to content
	</a>
	<Header session={data.session} profile={data.profile} />
	<div id="main-content" class="flex-1">
		<main class="mx-auto max-w-5xl px-4 py-8">
			{@render children()}
		</main>
	</div>
	<Footer />
</div>
