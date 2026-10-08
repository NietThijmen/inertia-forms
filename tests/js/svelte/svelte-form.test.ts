import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type { FormPayload } from '../../../resources/js/contract';
import Form from '../../../resources/js/svelte/Form.svelte';
import Field from '../../../resources/js/svelte/Field.svelte';
import OverrideDemo from './OverrideDemo.svelte';
import EmailOverride from './EmailOverride.svelte';
import EmailRenderer from './EmailRenderer.svelte';

const fixturePath = resolve(dirname(fileURLToPath(import.meta.url)), '../../Fixtures/form-payload.json');

function loadFixture(): FormPayload {
	return JSON.parse(readFileSync(fixturePath, 'utf8')) as FormPayload;
}

describe('svelte adapter', () => {
	it('renders the shared fixture with accessible labels and nested names', () => {
		const payload = loadFixture();
		render(Form, { payload });

		expect(screen.getByLabelText('Name')).toHaveAttribute('name', 'name');
		expect(screen.getByLabelText('Email')).toHaveValue('jane@example.com');
		expect(screen.getByLabelText('City')).toHaveAttribute('name', 'address[city]');
		expect(screen.getByLabelText('City')).toHaveValue('Amsterdam');
		expect(screen.getByText('Work email')).toBeInTheDocument();
		expect(document.querySelector('input[type="file"][name="avatar"]')).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
	});

	it('renders validation errors against the matching fields', () => {
		const payload = loadFixture();
		const nameField = payload.fields.find((field) => field.name === 'name')!;

		render(Field, {
			field: nameField,
			value: '',
			errors: { name: 'The name field is required.' },
			processing: false,
			formId: payload.id,
		});

		expect(screen.getByRole('alert')).toHaveTextContent('The name field is required.');
		expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
	});

	it('disables controls while processing', () => {
		const payload = loadFixture();
		const email = payload.fields.find((field) => field.name === 'email')!;

		render(Field, {
			field: email,
			value: 'jane@example.com',
			errors: {},
			processing: true,
			formId: payload.id,
		});

		expect(screen.getByLabelText('Email')).toBeDisabled();
	});

	it('replaces a built-in field when components.email is set', () => {
		const payload = loadFixture();

		render(Form, {
			payload,
			errors: { email: 'Invalid email.' },
			processing: true,
			renderers: { email: EmailRenderer },
			components: { email: EmailOverride },
		});

		const custom = screen.getByTestId('custom-email');
		expect(custom).toHaveTextContent('Email');
		expect(custom).toHaveAttribute('data-value', 'jane@example.com');
		expect(custom).toHaveAttribute('data-form-id', payload.id);
		expect(custom).toHaveAttribute('data-processing', 'true');
		expect(custom).toHaveAttribute('data-error', 'Invalid email.');
		expect(screen.queryByTestId('renderer-email')).not.toBeInTheDocument();
		expect(document.querySelector('input[name="email"]')).toBeNull();
		expect(screen.getByLabelText('Name')).toBeInTheDocument();
	});

	it('supports consumer field overrides', () => {
		render(OverrideDemo, { payload: loadFixture() });

		expect(screen.getByTestId('override-name')).toHaveTextContent('Name');
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
	});
});
