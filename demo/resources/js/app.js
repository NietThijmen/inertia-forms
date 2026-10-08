import { createInertiaApp } from '@inertiajs/svelte';
import { mount } from 'svelte';
import '../css/app.css';

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.svelte', { eager: true });

        return pages[`./pages/${name}.svelte`];
    },
    setup({ el, App, props }) {
        mount(App, { target: el, props });
    },
    progress: {
        color: '#111827',
    },
    title: (title) => (title ? `${title} - Sign in` : 'Sign in'),
});
