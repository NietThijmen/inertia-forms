import { afterEach, describe, expect, it } from 'vitest';
import { mountClassicForm } from '../../../resources/js/classic';
import { field, form, options } from '../helpers/field';

describe('classic field types', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('renders the added field types', async () => {
		const handle = mountClassicForm(
			document.body,
			form(
				[
					field({ name: 'title', type: 'text', label: 'Title' }),
					field({ name: 'slug', type: 'slug', label: 'Slug', from: 'title' }),
					field({ name: 'website', type: 'link', label: 'Website' }),
					field({ name: 'token', type: 'hidden', label: 'Token' }),
					field({ name: 'code', type: 'otp', label: 'Code', length: 4 }),
					field({
						name: 'country',
						type: 'combobox',
						label: 'Country',
						options: options(['nl', 'Netherlands'], ['be', 'Belgium']),
					}),
					field({
						name: 'tags',
						type: 'checkbox-group',
						label: 'Tags',
						htmlName: 'tags[]',
						options: options(['a', 'Alpha'], ['b', 'Beta']),
					}),
					field({ name: 'enabled', type: 'toggle', label: 'Enabled' }),
					field({ name: 'starts', type: 'time', label: 'Starts' }),
					field({ name: 'accent', type: 'color', label: 'Accent' }),
					field({
						name: 'volume',
						type: 'slider',
						label: 'Volume',
						attributes: { min: 0, max: 10, step: 1 },
					}),
					field({ name: 'note', type: 'composer', label: 'Note' }),
					field({ name: 'body', type: 'rich-text', label: 'Body' }),
					field({
						name: 'items',
						type: 'repeater',
						label: 'Items',
						fields: [field({ name: 'title', type: 'text', label: 'Item title' })],
					}),
					field({
						name: 'meta',
						type: 'key-value',
						label: 'Meta',
					}),
					field({
						name: 'intro',
						type: 'display',
						label: 'Hello',
						description: 'World',
						variant: 'heading',
					}),
					field({ name: 'save', type: 'submit', label: 'Save' }),
				],
				{
					title: 'Hello World',
					slug: '',
					token: 'abc',
					code: '1234',
					country: 'nl',
					tags: ['a'],
					enabled: true,
					starts: '15:04',
					accent: '#112233',
					volume: 4,
					note: 'Plain',
					body: 'Rich',
					items: [{ title: 'First' }],
					meta: [{ key: 'a', value: 'b' }],
				},
			),
		);

		const root = handle.element;
		await Promise.resolve();

		expect(root.querySelector('input[name="website"]')).toHaveAttribute('type', 'url');
		expect(root.querySelector('input[name="token"]')).toHaveAttribute('type', 'hidden');
		expect(root.querySelector('input[name="token"]')).toHaveValue('abc');
		expect(root.querySelector('[data-field="token"] label')).toBeNull();
		expect(root.querySelectorAll('[data-otp-box]')).toHaveLength(4);
		expect(root.querySelector('[autocomplete="one-time-code"]')).not.toBeNull();
		expect(root.querySelector('input[name="code"]')).toHaveValue('1234');
		expect(root.querySelector('[role="combobox"]')).toHaveValue('Netherlands');
		expect(root.querySelector('input[type="hidden"][name="country"]')).toHaveValue('nl');
		expect(root.querySelector('input[name="tags[]"][value="a"]')).toBeChecked();
		expect(root.querySelector('input[name="enabled"][role="switch"]')).toBeChecked();
		expect(root.querySelector('input[name="starts"]')).toHaveAttribute('type', 'time');
		expect(root.querySelector('input[name="starts"]')).toHaveValue('15:04');
		expect(root.querySelector('input[name="accent"]')).toHaveAttribute('type', 'color');
		expect(root.querySelector('input[name="volume"]')).toHaveAttribute('type', 'range');
		expect(root.querySelector('input[name="volume"]')?.parentElement?.querySelector('output')).toHaveTextContent('4');
		expect(root.querySelector('textarea[name="note"]')).toHaveValue('Plain');
		expect(root.querySelector('[contenteditable="true"]')).toHaveTextContent('Rich');
		expect(root.querySelector('input[name="body"]')).toHaveAttribute('type', 'hidden');
		expect(root.querySelector('input[name="items[0][title]"]')).toHaveValue('First');
		expect(root.querySelectorAll('[data-repeater-row]')).toHaveLength(1);
		expect(root.querySelector('input[name="meta[0][key]"]')).toHaveValue('a');
		expect(root.querySelector('input[name="meta[0][value]"]')).toHaveValue('b');
		expect(root.querySelector('[data-type="display"][data-variant="heading"] h3')).toHaveTextContent('Hello');
		expect(root.querySelector('[data-type="display"] input')).toBeNull();
		expect(root.querySelector('button[type="submit"]')).toHaveTextContent('Save');
		expect(root.querySelectorAll('button[type="submit"]')).toHaveLength(1);

		const title = root.querySelector<HTMLInputElement>('input[name="title"]');
		const slug = root.querySelector<HTMLInputElement>('input[name="slug"]');
		expect(slug).toHaveValue('hello-world');

		title!.value = 'Another Title';
		title!.dispatchEvent(new Event('input', { bubbles: true }));
		expect(slug).toHaveValue('another-title');

		slug!.value = 'Custom Value!';
		slug!.dispatchEvent(new Event('input', { bubbles: true }));
		expect(slug).toHaveValue('custom-value');

		title!.value = 'Ignored';
		title!.dispatchEvent(new Event('input', { bubbles: true }));
		expect(slug).toHaveValue('custom-value');
	});
});
