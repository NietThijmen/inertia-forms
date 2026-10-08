<script>
	import { Form } from '@nietthijmen/inertia-forms/svelte';

	let { form } = $props();
</script>

<Form payload={form} submitLabel="Save profile" />
