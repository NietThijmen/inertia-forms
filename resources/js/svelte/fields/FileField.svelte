<script lang="ts">
	import { asRecord } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, errors, processing, formId }: FieldProps = $props();
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		<input
			type="file"
			{id}
			name={field.multiple ? `${field.htmlName}[]` : field.htmlName}
			required={field.required}
			disabled={field.disabled || processing}
			multiple={field.multiple}
			accept={field.accept ?? undefined}
			aria-invalid={errors[field.name] ? true : undefined}
			aria-describedby={described}
			{...asRecord(field.attributes)}
		/>
	{/snippet}
</FieldShell>
