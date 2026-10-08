<script lang="ts">
	import { asRecord, colorValue, inputValue } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	let htmlType = $derived(nativeHtmlType(field.type));
	let controlValue = $derived(
		htmlType === 'password' ? '' : htmlType === 'color' ? colorValue(value) : inputValue(value),
	);

	function nativeHtmlType(type: string): string {
		switch (type) {
			case 'email':
			case 'password':
			case 'number':
			case 'date':
			case 'time':
			case 'color':
				return type;
			case 'link':
				return 'url';
			default:
				return 'text';
		}
	}
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		<input
			type={htmlType}
			{id}
			name={field.htmlName}
			value={controlValue}
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
