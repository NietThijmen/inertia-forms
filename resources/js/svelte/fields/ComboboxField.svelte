<script lang="ts">
	import { fieldDomId, filterOptions, inputValue, optionLabelForValue, type FieldOption } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	let query = $state(readQuery());
	let selected = $state(readSelected());

	function readQuery(): string {
		return optionLabelForValue(field.options, value);
	}

	function readSelected(): string {
		return inputValue(value);
	}
	let matches = $derived(filterOptions(field.options, query));

	function choose(option: FieldOption): void {
		if (option.disabled) {
			return;
		}

		selected = String(option.value ?? '');
		query = option.label;
	}
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		{@const listId = `${fieldDomId(formId, field.name)}-list`}
		<div class="if-combobox">
			<input
				type="text"
				{id}
				role="combobox"
				aria-autocomplete="list"
				aria-controls={listId}
				aria-expanded={matches.length > 0}
				autocomplete="off"
				placeholder={field.placeholder ?? undefined}
				required={field.required}
				disabled={field.disabled || processing}
				readonly={field.readonly}
				aria-invalid={errors[field.name] ? true : undefined}
				aria-describedby={described}
				bind:value={query}
			/>
			<input type="hidden" name={field.htmlName} value={selected} />
			<ul id={listId} role="listbox">
				{#each matches as option (String(option.value))}
					<li role="option" aria-selected={String(option.value ?? '') === selected}>
						<button
							type="button"
							disabled={option.disabled || field.disabled || processing}
							onmousedown={(event) => event.preventDefault()}
							onclick={() => choose(option)}
						>
							{option.label}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/snippet}
</FieldShell>
