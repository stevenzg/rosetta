<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte'
	import type { Article } from '$lib/types'

	interface Props {
		open: boolean
		article: Article | null
		onClose: () => void
		onConfirm: () => Promise<void>
	}

	let { open, article, onClose, onConfirm }: Props = $props()
	let deleting = $state(false)

	$effect(() => {
		if (open) deleting = false
	})

	async function handleConfirm() {
		deleting = true
		await onConfirm()
		deleting = false
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose()
	}
</script>

{#if open && article}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="delete-dialog-title"
		aria-describedby="delete-dialog-desc"
		onkeydown={handleKeydown}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0" onclick={onClose} onkeydown={handleKeydown}></div>
		<div
			class="relative z-10 w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-xl"
		>
			<div class="mb-4 flex items-start gap-3">
				<AlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
				<div>
					<h2 id="delete-dialog-title" class="text-lg font-semibold text-foreground">
						Delete Article
					</h2>
					<p id="delete-dialog-desc" class="mt-1 text-sm text-muted-foreground">
						Are you sure you want to delete "<strong>{article.title}</strong>"? This action cannot
						be undone.
					</p>
				</div>
			</div>

			<div class="flex justify-end gap-2">
				<button
					type="button"
					onclick={onClose}
					class="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleConfirm}
					disabled={deleting}
					class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
				>
					{deleting ? 'Deleting...' : 'Delete'}
				</button>
			</div>
		</div>
	</div>
{/if}
