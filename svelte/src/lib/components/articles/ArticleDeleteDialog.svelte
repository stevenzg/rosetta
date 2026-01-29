<script lang="ts">
	import { X } from 'lucide-svelte'
	import type { Article } from '$lib/types'

	interface Props {
		open: boolean
		article: Article | null
		error?: string | null
		onClose: () => void
		onConfirm: () => Promise<void>
	}

	let { open, article, error = null, onClose, onConfirm }: Props = $props()
	let deleting = $state(false)
	let triggerElement: Element | null = $state(null)

	$effect(() => {
		if (open) {
			triggerElement = document.activeElement
			deleting = false
		} else if (triggerElement) {
			if (triggerElement instanceof HTMLElement) {
				triggerElement.focus()
			}
			triggerElement = null
		}
	})

	async function handleConfirm() {
		deleting = true
		try {
			await onConfirm()
		} finally {
			deleting = false
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose()
	}
</script>

{#if open && article}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="delete-dialog-title"
		aria-describedby="delete-dialog-desc"
		tabindex="-1"
		onkeydown={handleKeydown}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0" onclick={onClose} onkeydown={handleKeydown}></div>
		<div
			class="relative z-10 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg"
		>
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<h2 id="delete-dialog-title" class="text-lg font-semibold leading-none">
						Delete Article
					</h2>
					<button
						type="button"
						onclick={onClose}
						class="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						aria-label="Close dialog"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
				<p id="delete-dialog-desc" class="text-sm text-muted-foreground">
					Are you sure you want to delete &quot;{article.title}&quot;? This action cannot be undone.
				</p>
			</div>

			{#if error}
				<div class="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
					{error}
				</div>
			{/if}

			<div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<button
					type="button"
					onclick={onClose}
					disabled={deleting}
					class="rounded-md border bg-background px-4 py-2 text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleConfirm}
					disabled={deleting}
					class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
				>
					{deleting ? 'Deleting...' : 'Delete'}
				</button>
			</div>
		</div>
	</div>
{/if}
