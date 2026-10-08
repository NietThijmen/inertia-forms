<script lang="ts">
	import { asRecord } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	let selected = $derived(
		Array.isArray(value)
			? value.map((item) => String(item))
			: value === null || value === undefined
				? []
				: [String(value)],
	);
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		<select
			{id}
			name={field.multiple ? `${field.htmlName}[]` : field.htmlName}
			required={field.required}
			disabled={field.disabled || processing}
			multiple={field.multiple}
			aria-invalid={errors[field.name] ? true : undefined}
			aria-describedby={described}
			{...asRecord(field.attributes)}
		>
			{#if field.placeholder && !field.multiple}
				<option value="">{field.placeholder}</option>
			{/if}
			{#each field.options ?? [] as option (String(option.value))}
				<option
					value={String(option.value ?? '')}
					disabled={option.disabled}
					selected={selected.includes(String(option.value ?? ''))}
				>
					{option.label}
				</option>
			{/each}
		</select>
	{/snippet}
</FieldShell>
