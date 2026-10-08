<script lang="ts">
	import { asRecord, inputValue } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	let htmlType = $derived(
		field.type === 'email' || field.type === 'password' || field.type === 'number' || field.type === 'date'
			? field.type
			: 'text',
	);
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		<input
			type={htmlType}
			{id}
			name={field.htmlName}
			value={htmlType === 'password' ? '' : inputValue(value)}
			placeholder={field.placeholder ?? undefined}
			required={field.required}
			disabled={field.disabled || processing}
			readonly={field.readonly}
			aria-invalid={errors[field.name] ? true : undefined}
			aria-describedby={described}
			autocomplete={htmlType === 'password' ? 'new-password' : undefined}
			{...asRecord(field.attributes)}
		/>
	{/snippet}
</FieldShell>
