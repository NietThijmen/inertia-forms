<script lang="ts">
	import type { FieldProps } from '../../../resources/js/svelte';

	let { field }: FieldProps = $props();
</script>

<div data-testid="renderer-email">{field.name}</div>
