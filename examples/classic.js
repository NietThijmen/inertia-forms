import { mountClassicForm } from '@nietthijmen/inertia-forms/classic';

export function mountProfileForm(payload) {
	const root = document.getElementById('profile-form');

	return mountClassicForm(root, payload, {
		submit: 'auto',
		submitLabel: 'Save profile',
	});
}
