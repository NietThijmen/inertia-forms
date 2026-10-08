<script lang="ts">
	import { fieldDomId } from '../../shared/names';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();
</script>

<FieldShell {field} {formId} {errors} hideLabel>
	{#snippet children(id, described)}
		<div
			role="radiogroup"
			aria-labelledby="{id}-legend"
			aria-describedby={described}
			aria-invalid={errors[field.name] ? true : undefined}
		>
			<div id="{id}-legend">{field.label ?? field.name}</div>
			{#each field.options ?? [] as option, index (String(option.value))}
				{@const optionId = `${fieldDomId(formId, field.name)}-${index}`}
				<input
					type="radio"
					id={optionId}
					name={field.htmlName}
					value={String(option.value ?? '')}
					checked={String(value ?? '') === String(option.value ?? '')}
					required={field.required}
					disabled={field.disabled || processing || option.disabled}
				/>
				<label for={optionId}>{option.label}</label>
			{/each}
		</div>
	{/snippet}
</FieldShell>
