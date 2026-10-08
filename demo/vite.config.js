import { svelte } from '@sveltejs/vite-plugin-svelte';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        svelte(),
    ],
    resolve: {
        dedupe: ['@inertiajs/svelte', 'svelte'],
    },
    server: {
        fs: {
            allow: ['..'],
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    optimizeDeps: {
        exclude: ['@nietthijmen/inertia-forms'],
    },
});
