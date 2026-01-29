<script lang="ts">
	import { X } from 'lucide-svelte'
	import type { Article, ArticleCreate, ArticleStatus } from '$lib/types'

	interface Props {
		open: boolean
		article?: Article | null
		error?: string | null
		onClose: () => void
		onSubmit: (data: ArticleCreate) => Promise<void>
	}

	let { open, article = null, error = null, onClose, onSubmit }: Props = $props()

	let title = $state('')
	let content = $state('')
	let status = $state<ArticleStatus>('draft')
	let validationErrors = $state<{ title?: string; status?: string }>({})
	let submitting = $state(false)
	let triggerElement: Element | null = $state(null)

	const isEdit = $derived(!!article)
	const dialogTitle = $derived(isEdit ? 'Edit Article' : 'Create Article')

	$effect(() => {
		if (open) {
			// Capture the element that had focus before the dialog opened
			triggerElement = document.activeElement
			if (article) {
				title = article.title
				content = article.content ?? ''
				status = article.status
			} else {
				title = ''
				content = ''
				status = 'draft'
			}
			validationErrors = {}
		} else if (triggerElement) {
			// Restore focus to the trigger element when the dialog closes
			if (triggerElement instanceof HTMLElement) {
				triggerElement.focus()
			}
			triggerElement = null
		}
	})

	function validate(): boolean {
		const newErrors: { title?: string; status?: string } = {}
		if (!title.trim()) {
			newErrors.title = 'Title is required'
		} else if (title.length > 255) {
			newErrors.title = 'Title must be 255 characters or less'
		}
		if (status && !['draft', 'published'].includes(status)) {
			newErrors.status = 'Invalid status'
		}
		validationErrors = newErrors
		return Object.keys(newErrors).length === 0
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault()
		if (!validate()) return

		submitting = true
		try {
			await onSubmit({ title: title.trim(), content: content || undefined, status })
		} finally {
			submitting = false
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose()
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
		tabindex="-1"
		onkeydown={handleKeydown}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0" onclick={onClose} onkeydown={handleKeydown}></div>
		<div
			class="relative z-10 w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-xl"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 id="dialog-title" class="text-lg font-semibold text-foreground">{dialogTitle}</h2>
				<button
					type="button"
					onclick={onClose}
					class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					aria-label="Close dialog"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			{#if error}
				<div class="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
					{error}
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<label for="article-title" class="mb-1 block text-sm font-medium text-foreground">
						Title <span class="text-destructive">*</span>
					</label>
					<input
						id="article-title"
						type="text"
						bind:value={title}
						maxlength="255"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
						class:border-destructive={!!validationErrors.title}
						placeholder="Article title"
						aria-invalid={!!validationErrors.title}
						aria-describedby={validationErrors.title ? 'title-error' : undefined}
					/>
					{#if validationErrors.title}
						<p id="title-error" class="mt-1 text-sm text-destructive">{validationErrors.title}</p>
					{/if}
				</div>

				<div>
					<label for="article-content" class="mb-1 block text-sm font-medium text-foreground">
						Content
					</label>
					<textarea
						id="article-content"
						bind:value={content}
						rows="6"
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
						placeholder="Article content"
					></textarea>
				</div>

				<div>
					<label for="article-status" class="mb-1 block text-sm font-medium text-foreground">
						Status
					</label>
					<select
						id="article-status"
						bind:value={status}
						class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
						aria-invalid={!!validationErrors.status}
						aria-describedby={validationErrors.status ? 'status-error' : undefined}
					>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
					</select>
					{#if validationErrors.status}
						<p id="status-error" class="mt-1 text-sm text-destructive">{validationErrors.status}</p>
					{/if}
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button
						type="button"
						onclick={onClose}
						class="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={submitting}
						class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
					>
						{submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create article'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
