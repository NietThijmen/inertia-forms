import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountClassicForm } from '../../../resources/js/classic';
import type { FormPayload } from '../../../resources/js/contract';

const fixturePath = resolve(dirname(fileURLToPath(import.meta.url)), '../../Fixtures/form-payload.json');

function loadFixture(): FormPayload {
	return JSON.parse(readFileSync(fixturePath, 'utf8')) as FormPayload;
}

describe('classic adapter', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	});

	it('renders the shared fixture with accessible labels and nested names', () => {
		const payload = loadFixture();
		const handle = mountClassicForm(document.body, payload);

		expect(handle.element.querySelector('input[name="name"]')).toHaveValue('');
		expect(handle.element.querySelector('input[name="email"]')).toHaveValue('jane@example.com');
		expect(handle.element.querySelector('input[name="address[city]"]')).toHaveValue('Amsterdam');
		expect(handle.element.querySelector('label[for="if-profile-form-name"]')).toHaveTextContent('Name');
		expect(handle.element.querySelector('#if-profile-form-email-help')).toHaveTextContent('Work email');
		expect(handle.element.querySelector('input[type="file"][name="avatar"]')).not.toBeNull();
		expect(handle.element.querySelector('input[name="_method"]')).toHaveValue('PUT');
		expect(handle.element.method).toBe('post');
	});

	it('renders validation errors against the matching fields', () => {
		const handle = mountClassicForm(document.body, loadFixture(), {
			errors: {
				name: 'The name field is required.',
				'address.city': 'The city field is required.',
			},
		});

		expect(handle.element.querySelector('#if-profile-form-name-error')).toHaveTextContent(
			'The name field is required.',
		);
		expect(handle.element.querySelector('#if-profile-form-address-city-error')).toHaveTextContent(
			'The city field is required.',
		);
		expect(handle.element.querySelector('input[name="name"]')).toHaveAttribute('aria-invalid', 'true');
	});

	it('allows renderer overrides and manual field rendering', () => {
		const payload = loadFixture();
		const handle = mountClassicForm(document.body, payload, {
			renderers: {
				text: ({ field }) => {
					const el = document.createElement('div');
					el.dataset.custom = field.name;
					el.textContent = `custom:${field.name}`;
					return el;
				},
			},
		});

		expect(handle.element.querySelector('[data-custom="name"]')).toHaveTextContent('custom:name');
		expect(handle.element.querySelector('[data-custom="address.city"]')).toHaveTextContent('custom:address.city');
		expect(handle.element.querySelector('input[name="email"]')).not.toBeNull();
	});

	it('submits natively with FormData when no Inertia router is present', () => {
		const payload = { ...loadFixture(), method: 'POST', action: '/profile' };
		const handle = mountClassicForm(document.body, payload, { submit: 'native' });
		const name = handle.element.querySelector<HTMLInputElement>('input[name="name"]');
		const email = handle.element.querySelector<HTMLInputElement>('input[name="email"]');
		name!.value = 'Ada';
		email!.value = 'updated@example.com';

		const submitted = vi.fn((event: Event) => event.preventDefault());
		handle.element.addEventListener('submit', submitted);

		handle.element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

		expect(submitted).toHaveBeenCalledOnce();
		const event = submitted.mock.calls[0][0] as SubmitEvent;
		expect(event.defaultPrevented).toBe(true);

		const data = new FormData(handle.element);
		expect(data.get('email')).toBe('updated@example.com');
		expect(data.get('address[city]')).toBe('Amsterdam');
		expect(data.getAll('subscribe')).toEqual(['0', '1']);
	});

	it('uses the Inertia router when submit mode is inertia', () => {
		const visit = vi.fn();
		const payload = { ...loadFixture(), method: 'PUT', action: '/profile' };
		const handle = mountClassicForm(document.body, payload, {
			submit: 'inertia',
			router: { visit },
		});

		handle.element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

		expect(visit).toHaveBeenCalledOnce();
		const [url, options] = visit.mock.calls[0] as [string, { method: string; data: FormData }];
		expect(url).toBe('/profile');
		expect(options.method).toBe('put');
		expect(options.data).toBeInstanceOf(FormData);
		expect(options.data.get('email')).toBe('jane@example.com');
	});

	it('toggles processing state without claiming a successful no-js Inertia roundtrip', () => {
		const handle = mountClassicForm(document.body, loadFixture());

		handle.setProcessing(true);
		expect(handle.element.querySelector('button[type="submit"]')).toBeDisabled();
		expect(handle.element.querySelector('button[type="submit"]')).toHaveTextContent('Submitting…');

		handle.setProcessing(false);
		handle.setSuccessful(true);
		expect(handle.element.querySelector('.if-status')).toHaveTextContent('Saved.');
	});
});
