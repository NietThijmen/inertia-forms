<script lang="ts">
	import { displayVariant, renderDisplayVariant, type DisplayVariant } from '../../core';
	import type { FieldProps } from '../types';

	let { field }: FieldProps = $props();

	let variant: DisplayVariant = $derived(renderDisplayVariant(displayVariant(field.variant)));
</script>

<div class="if-field if-display" data-field={field.name} data-type="display" data-variant={variant}>
	{#if variant === 'heading'}
		<h3>{field.label}</h3>
		{#if field.description}
			<p>{field.description}</p>
		{/if}
	{:else if variant === 'paragraph'}
		<p>{field.label}</p>
		{#if field.description}
			<p class="if-help">{field.description}</p>
		{/if}
	{:else}
		<hr />
		{#if field.label}
			<p>{field.label}</p>
		{/if}
	{/if}
</div>
