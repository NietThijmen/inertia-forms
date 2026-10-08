import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	build: {
		lib: {
			entry: {
				classic: fileURLToPath(new URL('./resources/js/classic/index.ts', import.meta.url)),
				contract: fileURLToPath(new URL('./resources/js/contract.ts', import.meta.url)),
			},
			formats: ['es'],
		},
		rollupOptions: {
			external: ['@inertiajs/svelte', 'svelte'],
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/js/setup.ts'],
		include: ['tests/js/**/*.test.ts'],
		alias: {
			'@inertiajs/svelte': fileURLToPath(new URL('./tests/js/mocks/inertia-svelte.ts', import.meta.url)),
		},
	},
});
