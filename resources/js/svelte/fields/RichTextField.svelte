<script lang="ts">
	import { inputValue } from '../../core';
	import { applyInlineFormat } from '../../shared/editing';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	let html = $state(readHtml());
	let editor = $state<HTMLDivElement | undefined>(undefined);

	function readHtml(): string {
		return inputValue(value);
	}

	function attachEditor(node: HTMLDivElement): () => void {
		editor = node;
		node.textContent = html;

		return () => {
			if (editor === node) {
				editor = undefined;
			}
		};
	}

	function format(tag: 'strong' | 'em'): void {
		if (!editor) {
			return;
		}

		applyInlineFormat(editor, tag);
		html = editor.innerHTML;
	}

	function onInput(event: Event): void {
		if (event.currentTarget instanceof HTMLElement) {
			html = event.currentTarget.innerHTML;
		}
	}
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		<div class="if-rich-text">
			<div role="toolbar" aria-label="Formatting">
				<button
					type="button"
					disabled={field.disabled || processing}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => format('strong')}
				>
					Bold
				</button>
				<button
					type="button"
					disabled={field.disabled || processing}
					onmousedown={(event) => event.preventDefault()}
					onclick={() => format('em')}
				>
					Italic
				</button>
			</div>
			<div
				{id}
				role="textbox"
				aria-multiline="true"
				aria-label={field.label ?? field.name}
				aria-invalid={errors[field.name] ? true : undefined}
				aria-describedby={described}
				contenteditable={field.readonly || field.disabled || processing ? 'false' : 'true'}
				{@attach attachEditor}
				oninput={onInput}
			></div>
			<input type="hidden" name={field.htmlName} value={html} />
		</div>
	{/snippet}
</FieldShell>
