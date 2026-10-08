import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type { FieldPayload, JsonValue } from '../../../resources/js/contract';
import Field from '../../../resources/js/svelte/Field.svelte';
import Form from '../../../resources/js/svelte/Form.svelte';
import { field, form, options } from '../helpers/field';

function renderField(partial: FieldPayload, value: JsonValue | undefined = ''): HTMLElement {
	const { container } = render(Field, {
		field: partial,
		value,
		errors: {},
		processing: false,
		formId: 'demo',
	});

	return container;
}

describe('svelte field types', () => {
	it('renders the added field types', async () => {
		const payload = form(
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
					name: 'sections',
					type: 'blocks',
					label: 'Sections',
					blocks: [
						{
							type: 'hero',
							label: 'Hero',
							fields: [field({ name: 'headline', type: 'text', label: 'Headline' })],
						},
					],
				}),
				field({ name: 'meta', type: 'key-value', label: 'Meta' }),
				field({ name: 'intro', type: 'display', label: 'Hello', description: 'World', variant: 'heading' }),
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
				sections: [{ type: 'hero', data: { headline: 'Hi' } }],
				meta: [{ key: 'a', value: 'b' }],
			},
		);

		const { container } = render(Form, { payload });
		await Promise.resolve();

		expect(container.querySelector('input[name="website"]')).toHaveAttribute('type', 'url');
		expect(container.querySelector('input[name="token"]')).toHaveAttribute('type', 'hidden');
		expect(container.querySelector('input[name="token"]')).toHaveValue('abc');
		expect(container.querySelector('[data-field="token"] label')).toBeNull();
		expect(container.querySelector('[autocomplete="one-time-code"]')).not.toBeNull();
		expect(container.querySelectorAll('[data-otp-box]')).toHaveLength(4);
		expect(container.querySelector('input[name="code"]')).toHaveValue('1234');
		expect(container.querySelector('[role="combobox"]')).toHaveValue('Netherlands');
		expect(container.querySelector('input[type="hidden"][name="country"]')).toHaveValue('nl');
		expect(container.querySelector('input[name="tags[]"][value="a"]')).toBeChecked();
		expect(screen.getByRole('switch', { name: 'Enabled' })).toBeChecked();
		expect(container.querySelector('input[name="starts"]')).toHaveAttribute('type', 'time');
		expect(container.querySelector('input[name="accent"]')).toHaveAttribute('type', 'color');
		expect(container.querySelector('input[name="volume"]')).toHaveAttribute('type', 'range');
		expect(container.querySelector('output')).toHaveTextContent('4');
		expect(container.querySelector('textarea[name="note"]')).toHaveValue('Plain');
		expect(container.querySelector('[role="textbox"]')).toHaveTextContent('Rich');
		expect(container.querySelector('input[type="hidden"][name="body"]')).not.toBeNull();
		expect(container.querySelector('input[name="items[0][title]"]')).toHaveValue('First');
		expect(container.querySelectorAll('[data-repeater-row]')).toHaveLength(1);
		expect(container.querySelector('input[name="sections[0][type]"]')).toHaveValue('hero');
		expect(container.querySelector('input[name="sections[0][data][headline]"]')).toHaveValue('Hi');
		expect(container.querySelector('input[name="meta[0][key]"]')).toHaveValue('a');
		expect(container.querySelector('input[name="meta[0][value]"]')).toHaveValue('b');
		expect(container.querySelector('[data-variant="heading"] h3')).toHaveTextContent('Hello');
		expect(container.querySelector('[data-type="display"] input')).toBeNull();
		expect(screen.getAllByRole('button', { name: 'Save' })).toHaveLength(1);

		const title = container.querySelector<HTMLInputElement>('input[name="title"]');
		const slug = container.querySelector<HTMLInputElement>('input[name="slug"]');
		expect(slug).toHaveValue('hello-world');
		title!.value = 'Another Title';
		title!.dispatchEvent(new Event('input', { bubbles: true }));
		expect(slug).toHaveValue('another-title');
	});

	it('renders one repeater row from the value array', () => {
		const container = renderField(
			field({
				name: 'items',
				type: 'repeater',
				label: 'Items',
				fields: [field({ name: 'title', type: 'text', label: 'Item title' })],
			}),
			[{ title: 'First' }],
		);

		expect(container.querySelector('input[name="items[0][title]"]')).toHaveValue('First');
		expect(container.querySelectorAll('[data-repeater-row]')).toHaveLength(1);
	});
});
