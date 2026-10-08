<script lang="ts">
	import type { FieldProps } from '../types';

	let { field, processing }: FieldProps = $props();
</script>

<div class="if-field" data-field={field.name} data-type="submit">
	<button type="submit" name={field.htmlName} value={field.label ?? 'Submit'} disabled={field.disabled || processing}>
		{field.label ?? 'Submit'}
	</button>
	{#if field.description}
		<p class="if-help">{field.description}</p>
	{/if}
</div>
