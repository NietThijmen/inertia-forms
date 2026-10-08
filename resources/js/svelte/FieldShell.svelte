<script lang="ts">
	import type { Snippet } from 'svelte';
	import { describedBy, fieldDomId, type FieldShellProps } from '../core';

	type Props = FieldShellProps & {
		children: Snippet<[string, string | undefined]>;
	};

	let { field, formId, errors, hideLabel = false, children }: Props = $props();

	let id = $derived(fieldDomId(formId, field.name));
	let message = $derived(errors[field.name] ?? '');
	let described = $derived(describedBy(field, formId, Boolean(message)));
</script>

<div class="if-field" data-field={field.name} data-type={field.type}>
	{#if !hideLabel}
		<label for={id}>{field.label ?? field.name}</label>
	{/if}

	{@render children(id, described)}

	{#if field.description}
		<p id="{id}-help" class="if-help">{field.description}</p>
	{/if}

	{#if message}
		<p id="{id}-error" class="if-error" role="alert">{message}</p>
	{/if}
</div>
