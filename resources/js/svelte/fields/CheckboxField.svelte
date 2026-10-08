<script lang="ts">
	import { asRecord } from '../../shared/names';
	import { isChecked } from '../../shared/values';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

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
			type="checkbox"
			{id}
			name={field.htmlName}
			value={checkedValue}
			checked={isChecked(value)}
			required={field.required}
			disabled={field.disabled || processing}
			aria-invalid={errors[field.name] ? true : undefined}
			aria-describedby={described}
			{...asRecord(field.attributes)}
		/>
		<label for={id}>{field.label ?? field.name}</label>
	{/snippet}
</FieldShell>
