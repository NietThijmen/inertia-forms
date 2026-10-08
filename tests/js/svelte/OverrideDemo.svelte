<script lang="ts">
	import type { FormPayload } from '../../../resources/js/contract';
	import Form from '../../../resources/js/svelte/Form.svelte';
	import Field from '../../../resources/js/svelte/Field.svelte';

	let { payload }: { payload: FormPayload } = $props();
</script>

<Form {payload}>
	{#snippet field({ field, value, errors, processing })}
		{#if field.name === 'name'}
			<div data-testid="override-name">{field.label}</div>
		{:else}
			<Field {field} {value} {errors} {processing} formId={payload.id} />
		{/if}
	{/snippet}
</Form>
