<script lang="ts">
	import { Form as InertiaForm } from '@inertiajs/svelte';
	import type { Snippet } from 'svelte';
	import type { FieldPayload, FormPayload, JsonValue } from '../contract';
	import { getValue } from '../shared/values';
	import Field from './Field.svelte';
	import type { FieldRendererMap, FormRenderContext, InertiaFormState } from './types';

	type Props = {
		payload: FormPayload;
		renderers?: FieldRendererMap;
		submitLabel?: string;
		children?: Snippet<[FormRenderContext]>;
		field?: Snippet<
			[{ field: FieldPayload; value: JsonValue | undefined; errors: Record<string, string>; processing: boolean }]
		>;
		[key: string]: unknown;
	};

	let {
		payload,
		renderers = {},
		submitLabel = 'Submit',
		children: manual,
		field: fieldSnippet,
		...inertiaProps
	}: Props = $props();

	type InertiaMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

	function inertiaMethod(method: string): InertiaMethod {
		switch (method.toLowerCase()) {
			case 'get':
				return 'get';
			case 'post':
				return 'post';
			case 'put':
				return 'put';
			case 'patch':
				return 'patch';
			case 'delete':
				return 'delete';
			default:
				return 'post';
		}
	}
</script>

<InertiaForm action={payload.action ?? ''} method={inertiaMethod(payload.method)} {...inertiaProps}>
	{#snippet children(state)}
		{@const formState = state as InertiaFormState}
		{#if manual}
			{@render manual({ ...formState, payload })}
		{:else}
			{#if payload.title}
				<h2>{payload.title}</h2>
			{/if}
			{#if payload.description}
				<p class="if-form-description">{payload.description}</p>
			{/if}

			{#each payload.fields as formField (formField.name)}
				{#if fieldSnippet}
					{@render fieldSnippet({
						field: formField,
						value: getValue(payload.values, formField.name),
						errors: formState.errors,
						processing: formState.processing,
					})}
				{:else}
					<Field
						field={formField}
						value={getValue(payload.values, formField.name)}
						errors={formState.errors}
						processing={formState.processing}
						formId={payload.id}
						{renderers}
					/>
				{/if}
			{/each}

			<button type="submit" disabled={formState.processing}>
				{formState.processing ? 'Submitting…' : submitLabel}
			</button>

			{#if formState.wasSuccessful}
				<p class="if-status" data-inertia-form-success="">Saved.</p>
			{/if}
		{/if}
	{/snippet}
</InertiaForm>
