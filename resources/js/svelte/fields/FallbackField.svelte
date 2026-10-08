<script lang="ts">
	import InputField from './InputField.svelte';
	import type { FieldProps } from '../types';

	let props: FieldProps = $props();
</script>

<InputField {...props} />
