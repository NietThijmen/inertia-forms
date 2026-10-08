<script lang="ts">
	import { asRecord, inputValue } from '../../core';
	import type { FieldProps } from '../types';

	let { field, value }: FieldProps = $props();
</script>

<input
	{...asRecord(field.attributes)}
	type="hidden"
	name={field.htmlName}
	value={inputValue(value)}
	disabled={field.disabled}
/>
