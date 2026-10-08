<script lang="ts">
	import { arrayHtmlName, fieldDomId, stringList } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	let selected = $derived(stringList(value));
	let name = $derived(arrayHtmlName(field.htmlName));
</script>

<FieldShell {field} {formId} {errors} hideLabel>
	{#snippet children(id, described)}
		<div role="group" aria-labelledby={id} aria-describedby={described}>
			<div {id}>{field.label ?? field.name}</div>
			{#each field.options ?? [] as option, index (String(option.value))}
				{@const optionId = `${fieldDomId(formId, field.name)}-${index}`}
				<input
					type="checkbox"
					id={optionId}
					{name}
					value={String(option.value ?? '')}
					checked={selected.includes(String(option.value ?? ''))}
					disabled={field.disabled || processing || option.disabled}
				/>
				<label for={optionId}>{option.label}</label>
			{/each}
		</div>
	{/snippet}
</FieldShell>
