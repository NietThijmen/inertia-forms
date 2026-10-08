<script>
	import { Form } from '@nietthijmen/inertia-forms/svelte';

	let { form, flash } = $props();
</script>

<main class="screen">
	<section class="card">
		{#if flash.success}
			<p class="banner" role="status">{flash.success}</p>
		{/if}

		<Form payload={form} submitLabel="Sign in" />
	</section>
</main>

<style>
	.screen {
		display: grid;
		min-height: 100vh;
		place-items: center;
		padding: 1.5rem;
	}

	.card {
		width: min(100%, 24rem);
		padding: 1.75rem 1.5rem 1.25rem;
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgb(17 24 39 / 6%);
	}

	.banner {
		margin: 0 0 1rem;
		padding: 0.7rem 0.8rem;
		border-radius: 8px;
		background: #ecfdf3;
		color: #166534;
	}
</style>
