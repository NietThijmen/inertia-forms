<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { InertiaFormState } from '../../../resources/js/svelte/types';

	type Props = {
		action?: string;
		method?: string;
		errors?: Record<string, string>;
		processing?: boolean;
		wasSuccessful?: boolean;
		children?: Snippet<[InertiaFormState]>;
		[key: string]: unknown;
	};

	let {
		action = '',
		method = 'post',
		errors = {},
		processing = false,
		wasSuccessful = false,
		children,
		...rest
	}: Props = $props();

	let state = $derived<InertiaFormState>({
		errors,
		hasErrors: Object.keys(errors).length > 0,
		processing,
		progress: null,
		wasSuccessful,
		recentlySuccessful: wasSuccessful,
		isDirty: false,
		setError: () => {},
		clearErrors: () => {},
		resetAndClearErrors: () => {},
		defaults: () => {},
		reset: () => {},
		submit: () => {},
		cancel: () => {},
	});
</script>

<form {action} method={method === 'get' ? 'get' : 'post'} data-inertia-form="" {...rest}>
	{#if children}
		{@render children(state)}
	{/if}
</form>
