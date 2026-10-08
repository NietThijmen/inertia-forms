<script lang="ts">
	import { asRecord, inputValue } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		<textarea
			{id}
			name={field.htmlName}
			value={inputValue(value)}
			placeholder={field.placeholder ?? undefined}
			required={field.required}
			disabled={field.disabled || processing}
			readonly={field.readonly}
			aria-invalid={errors[field.name] ? true : undefined}
			aria-describedby={described}
			{...asRecord(field.attributes)}
		></textarea>
	{/snippet}
</FieldShell>
