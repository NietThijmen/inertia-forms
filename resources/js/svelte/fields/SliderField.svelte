<script lang="ts">
	import { asRecord, sliderValue } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	let current = $state(readCurrent());

	function readCurrent(): string {
		return sliderValue(value, field.attributes);
	}
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		<input
			{...asRecord(field.attributes)}
			type="range"
			{id}
			name={field.htmlName}
			bind:value={current}
			required={field.required}
			disabled={field.disabled || processing}
			aria-invalid={errors[field.name] ? true : undefined}
			aria-describedby={described}
		/>
		<output for={id}>{current}</output>
	{/snippet}
</FieldShell>
