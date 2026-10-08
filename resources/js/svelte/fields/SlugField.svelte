<script lang="ts">
	import { asRecord, inputValue } from '../../core';
	import { bindSlugInput } from '../../shared/editing';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		<input
			type="text"
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
			{@attach (node) => {
				bindSlugInput(node, typeof field.from === 'string' ? field.from : null);

				return () => {
					delete node.dataset.slug;
					delete node.dataset.slugFrom;
					delete node.dataset.slugTouched;
				};
			}}
		/>
	{/snippet}
</FieldShell>
