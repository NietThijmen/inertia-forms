<script lang="ts">
	import { asRecord, isChecked } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	let checked = $state(readChecked());

	function readChecked(): boolean {
		return isChecked(value);
	}
	let checkedValue = $derived(
		field.attributes.value !== undefined && field.attributes.value !== null
			? String(field.attributes.value)
			: '1',
	);
</script>

<FieldShell {field} {formId} {errors} hideLabel>
	{#snippet children(id, described)}
		<input type="hidden" name={field.htmlName} value="0" />
		<input
			{...asRecord(field.attributes)}
			type="checkbox"
			role="switch"
			{id}
			name={field.htmlName}
			value={checkedValue}
			bind:checked
			aria-checked={checked}
			required={field.required}
			disabled={field.disabled || processing}
			aria-invalid={errors[field.name] ? true : undefined}
			aria-describedby={described}
		/>
		<label for={id}>{field.label ?? field.name}</label>
	{/snippet}
</FieldShell>
