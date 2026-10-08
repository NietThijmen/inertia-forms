import type { FieldPayload, JsonValue } from '../contract';
import {
	arrayHtmlName,
	asRecord,
	blockChildField,
	blockDefinition,
	blockRows,
	blockTypeName,
	colorValue,
	describedBy,
	displayVariant,
	errorList,
	fieldDomId,
	filterOptions,
	inputValue,
	isChecked,
	keyValueNames,
	keyValueRows,
	objectRows,
	optionLabelForValue,
	otpLength,
	renderDisplayVariant,
	repeaterChildField,
	resolveComponent,
	sliderValue,
	stringList,
	type BlockRow,
	type ComponentMap,
	type FieldProps,
	type KeyValueRow,
} from '../core';
import { applyInlineFormat, bindSlugInput } from '../shared/editing';
import type { FieldRenderer } from './types';

function messageFor(errors: Record<string, string>, name: string): string {
	return errorList(errors, name)[0] ?? '';
}

function applyAttributes(element: HTMLElement, field: FieldPayload): void {
	for (const [name, value] of Object.entries(asRecord(field.attributes))) {
		if (value === null || value === false) {
			continue;
		}

		if (value === true) {
			element.setAttribute(name, '');
			continue;
		}

		element.setAttribute(name, String(value));
	}
}

function wrapField(context: FieldProps, control: HTMLElement | DocumentFragment): HTMLElement {
	const { field, errors, formId } = context;
	const id = fieldDomId(formId, field.name);
	const message = messageFor(errors, field.name);
	const wrapper = document.createElement('div');
	wrapper.className = 'if-field';
	wrapper.dataset.field = field.name;
	wrapper.dataset.type = field.type;

	if (field.type !== 'checkbox' && field.type !== 'radio' && field.type !== 'toggle') {
		const label = document.createElement('label');
		label.setAttribute('for', id);
		label.textContent = field.label ?? field.name;
		wrapper.appendChild(label);
	}

	wrapper.appendChild(control);

	if (field.description) {
		const help = document.createElement('p');
		help.id = `${id}-help`;
		help.className = 'if-help';
		help.textContent = field.description;
		wrapper.appendChild(help);
	}

	const error = document.createElement('p');
	error.id = `${id}-error`;
	error.className = 'if-error';
	error.setAttribute('role', 'alert');
	error.hidden = message === '';
	error.textContent = message;
	wrapper.appendChild(error);

	return wrapper;
}

function inputRenderer(htmlType: string, mapValue?: (value: JsonValue | undefined) => string): FieldRenderer {
	return (context) => {
		const { field, value, errors, processing, formId } = context;
		const input = document.createElement('input');
		const id = fieldDomId(formId, field.name);
		const message = messageFor(errors, field.name);

		input.type = htmlType;
		input.id = id;
		input.name = field.htmlName;
		input.required = field.required;
		input.disabled = field.disabled || processing;
		input.readOnly = field.readonly;

		if (htmlType !== 'file' && htmlType !== 'password') {
			input.value = mapValue ? mapValue(value) : inputValue(value);
		} else if (htmlType === 'password') {
			input.value = '';
			input.autocomplete = 'new-password';
		}

		if (field.placeholder) {
			input.placeholder = field.placeholder;
		}

		const described = describedBy(field, formId, message !== '');
		if (described) {
			input.setAttribute('aria-describedby', described);
		}

		if (message !== '') {
			input.setAttribute('aria-invalid', 'true');
		}

		applyAttributes(input, field);

		return wrapField(context, input);
	};
}

function textareaRenderer(context: FieldProps): HTMLElement {
	const { field, value, errors, processing, formId } = context;
	const textarea = document.createElement('textarea');
	const id = fieldDomId(formId, field.name);
	const message = messageFor(errors, field.name);

	textarea.id = id;
	textarea.name = field.htmlName;
	textarea.required = field.required;
	textarea.disabled = field.disabled || processing;
	textarea.readOnly = field.readonly;
	textarea.value = inputValue(value);

	if (field.placeholder) {
		textarea.placeholder = field.placeholder;
	}

	const described = describedBy(field, formId, message !== '');
	if (described) {
		textarea.setAttribute('aria-describedby', described);
	}

	if (message !== '') {
		textarea.setAttribute('aria-invalid', 'true');
	}

	applyAttributes(textarea, field);

	return wrapField(context, textarea);
}

function checkboxRenderer(context: FieldProps): HTMLElement {
	const { field, value, processing, formId } = context;
	const id = fieldDomId(formId, field.name);
	const fragment = document.createDocumentFragment();

	const hidden = document.createElement('input');
	hidden.type = 'hidden';
	hidden.name = field.htmlName;
	hidden.value = '0';
	fragment.appendChild(hidden);

	const input = document.createElement('input');
	input.type = 'checkbox';
	input.id = id;
	input.name = field.htmlName;
	input.value = field.attributes.value !== undefined && field.attributes.value !== null
		? String(field.attributes.value)
		: '1';
	input.checked = isChecked(value);
	input.required = field.required;
	input.disabled = field.disabled || processing;
	applyAttributes(input, field);
	fragment.appendChild(input);

	const label = document.createElement('label');
	label.setAttribute('for', id);
	label.textContent = field.label ?? field.name;
	fragment.appendChild(label);

	return wrapField(context, fragment);
}

function selectRenderer(context: FieldProps): HTMLElement {
	const { field, value, errors, processing, formId } = context;
	const select = document.createElement('select');
	const id = fieldDomId(formId, field.name);
	const message = messageFor(errors, field.name);

	select.id = id;
	select.name = field.multiple ? `${field.htmlName}[]` : field.htmlName;
	select.required = field.required;
	select.disabled = field.disabled || processing;
	select.multiple = Boolean(field.multiple);

	if (field.placeholder && !field.multiple) {
		const option = document.createElement('option');
		option.value = '';
		option.textContent = field.placeholder;
		select.appendChild(option);
	}

	const selected = new Set(
		Array.isArray(value) ? value.map((item) => String(item)) : value === null || value === undefined ? [] : [String(value)],
	);

	for (const item of field.options ?? []) {
		const option = document.createElement('option');
		option.value = String(item.value ?? '');
		option.textContent = item.label;
		option.disabled = item.disabled;
		option.selected = selected.has(String(item.value ?? ''));
		select.appendChild(option);
	}

	const described = describedBy(field, formId, message !== '');
	if (described) {
		select.setAttribute('aria-describedby', described);
	}

	if (message !== '') {
		select.setAttribute('aria-invalid', 'true');
	}

	applyAttributes(select, field);

	return wrapField(context, select);
}

function radioRenderer(context: FieldProps): HTMLElement {
	const { field, value, processing, formId } = context;
	const group = document.createElement('div');
	group.setAttribute('role', 'radiogroup');
	group.setAttribute('aria-label', field.label ?? field.name);

	(field.options ?? []).forEach((item, index) => {
		const optionId = `${fieldDomId(formId, field.name)}-${index}`;
		const input = document.createElement('input');
		input.type = 'radio';
		input.id = optionId;
		input.name = field.htmlName;
		input.value = String(item.value ?? '');
		input.checked = String(value ?? '') === String(item.value ?? '');
		input.required = field.required;
		input.disabled = field.disabled || processing || item.disabled;
		group.appendChild(input);

		const label = document.createElement('label');
		label.setAttribute('for', optionId);
		label.textContent = item.label;
		group.appendChild(label);
	});

	return wrapField(context, group);
}

function fileRenderer(context: FieldProps): HTMLElement {
	const { field, errors, processing, formId } = context;
	const input = document.createElement('input');
	const id = fieldDomId(formId, field.name);
	const message = messageFor(errors, field.name);

	input.type = 'file';
	input.id = id;
	input.name = field.multiple ? `${field.htmlName}[]` : field.htmlName;
	input.required = field.required;
	input.disabled = field.disabled || processing;
	input.multiple = Boolean(field.multiple);

	if (field.accept) {
		input.accept = field.accept;
	}

	const described = describedBy(field, formId, message !== '');
	if (described) {
		input.setAttribute('aria-describedby', described);
	}

	if (message !== '') {
		input.setAttribute('aria-invalid', 'true');
	}

	applyAttributes(input, field);

	return wrapField(context, input);
}

const textFallback = inputRenderer('text');

const builtins: Record<string, FieldRenderer> = {
	text: inputRenderer('text'),
	email: inputRenderer('email'),
	password: inputRenderer('password'),
	number: inputRenderer('number'),
	date: inputRenderer('date'),
	textarea: textareaRenderer,
	checkbox: checkboxRenderer,
	select: selectRenderer,
	radio: radioRenderer,
	file: fileRenderer,
	slug: slugRenderer,
	link: inputRenderer('url'),
	hidden: hiddenRenderer,
	otp: otpRenderer,
	combobox: comboboxRenderer,
	'checkbox-group': checkboxGroupRenderer,
	toggle: toggleRenderer,
	time: inputRenderer('time'),
	color: inputRenderer('color', colorValue),
	slider: sliderRenderer,
	composer: textareaRenderer,
	'rich-text': richTextRenderer,
	repeater: repeaterRenderer,
	blocks: blocksRenderer,
	'key-value': keyValueRenderer,
	display: displayRenderer,
	submit: submitRenderer,
};

export function defaultRenderers(): Record<string, FieldRenderer> {
	return { ...builtins };
}

export function resolveRenderer(
	type: string,
	overrides: ComponentMap<FieldRenderer> = {},
): FieldRenderer {
	return resolveComponent(type, overrides, builtins, textFallback);
}

export function renderField(
	context: FieldProps,
	overrides: ComponentMap<FieldRenderer> = {},
): HTMLElement {
	return resolveRenderer(context.field.type, overrides)(context, overrides);
}

function slugRenderer(context: FieldProps): HTMLElement {
	const wrapped = inputRenderer('text')(context);
	const input = wrapped.querySelector('input');

	if (input) {
		bindSlugInput(input, typeof context.field.from === 'string' ? context.field.from : null);
	}

	return wrapped;
}

function hiddenRenderer(context: FieldProps): HTMLElement {
	const { field, value } = context;
	const input = document.createElement('input');

	applyAttributes(input, field);
	input.type = 'hidden';
	input.name = field.htmlName;
	input.value = inputValue(value);
	input.disabled = field.disabled;

	return input;
}

function otpRenderer(context: FieldProps): HTMLElement {
	const { field, value, errors, processing, formId } = context;
	const length = otpLength(field);
	const id = fieldDomId(formId, field.name);
	const message = messageFor(errors, field.name);
	const group = document.createElement('div');
	const hidden = document.createElement('input');
	const initial = inputValue(value).slice(0, length).split('');

	group.setAttribute('role', 'group');
	group.setAttribute('autocomplete', 'one-time-code');
	group.setAttribute('aria-label', field.label ?? field.name);

	hidden.type = 'hidden';
	hidden.name = field.htmlName;
	group.appendChild(hidden);

	const boxes: HTMLInputElement[] = [];

	const sync = (): void => {
		hidden.value = boxes.map((box) => box.value).join('');
	};

	for (let index = 0; index < length; index += 1) {
		const box = document.createElement('input');
		box.type = 'text';
		box.maxLength = 1;
		box.size = 1;
		box.inputMode = 'numeric';
		box.dataset.otpBox = '';
		box.value = initial[index] ?? '';
		box.disabled = field.disabled || processing;
		box.readOnly = field.readonly;
		box.setAttribute('aria-label', `${field.label ?? field.name} ${index + 1}`);

		if (index === 0) {
			box.id = id;
		}

		box.addEventListener('input', () => {
			box.value = box.value.slice(-1);
			sync();

			if (box.value !== '' && boxes[index + 1]) {
				boxes[index + 1].focus();
			}
		});

		box.addEventListener('keydown', (event) => {
			if (event.key === 'Backspace' && box.value === '' && boxes[index - 1]) {
				boxes[index - 1].focus();
			}
		});

		boxes.push(box);
		group.appendChild(box);
	}

	group.addEventListener('paste', (event) => {
		const text = event.clipboardData?.getData('text') ?? '';
		const chars = text.replace(/\s+/g, '').slice(0, length).split('');

		if (chars.length === 0) {
			return;
		}

		event.preventDefault();
		boxes.forEach((box, index) => {
			box.value = chars[index] ?? '';
		});
		sync();
		boxes[Math.min(chars.length, length) - 1]?.focus();
	});

	sync();

	const described = describedBy(field, formId, message !== '');
	if (described) {
		group.setAttribute('aria-describedby', described);
	}

	return wrapField(context, group);
}

function comboboxRenderer(context: FieldProps): HTMLElement {
	const { field, value, errors, processing, formId } = context;
	const id = fieldDomId(formId, field.name);
	const listId = `${id}-list`;
	const message = messageFor(errors, field.name);
	const shell = document.createElement('div');
	const filter = document.createElement('input');
	const submitted = document.createElement('input');
	const list = document.createElement('ul');
	let selected = inputValue(value);

	shell.className = 'if-combobox';
	filter.type = 'text';
	filter.id = id;
	filter.setAttribute('role', 'combobox');
	filter.setAttribute('aria-autocomplete', 'list');
	filter.setAttribute('aria-controls', listId);
	filter.setAttribute('aria-expanded', 'false');
	filter.autocomplete = 'off';
	filter.placeholder = field.placeholder ?? '';
	filter.required = field.required;
	filter.disabled = field.disabled || processing;
	filter.readOnly = field.readonly;
	filter.value = optionLabelForValue(field.options, value);

	submitted.type = 'hidden';
	submitted.name = field.htmlName;
	submitted.value = selected;

	list.id = listId;
	list.setAttribute('role', 'listbox');

	const paint = (): void => {
		const matches = filterOptions(field.options, filter.value);
		list.replaceChildren();
		filter.setAttribute('aria-expanded', matches.length > 0 ? 'true' : 'false');

		for (const option of matches) {
			const item = document.createElement('li');
			const button = document.createElement('button');
			item.setAttribute('role', 'option');
			item.setAttribute('aria-selected', String(option.value ?? '') === selected ? 'true' : 'false');
			button.type = 'button';
			button.textContent = option.label;
			button.disabled = option.disabled || field.disabled || processing;
			button.addEventListener('mousedown', (event) => event.preventDefault());
			button.addEventListener('click', () => {
				if (option.disabled) {
					return;
				}

				selected = String(option.value ?? '');
				submitted.value = selected;
				filter.value = option.label;
				paint();
			});
			item.appendChild(button);
			list.appendChild(item);
		}
	};

	filter.addEventListener('input', paint);
	filter.addEventListener('focus', paint);

	const described = describedBy(field, formId, message !== '');
	if (described) {
		filter.setAttribute('aria-describedby', described);
	}

	if (message !== '') {
		filter.setAttribute('aria-invalid', 'true');
	}

	paint();
	shell.append(filter, submitted, list);

	return wrapField(context, shell);
}

function checkboxGroupRenderer(context: FieldProps): HTMLElement {
	const { field, value, processing, formId } = context;
	const selected = new Set(stringList(value));
	const group = document.createElement('div');
	const name = arrayHtmlName(field.htmlName);

	group.setAttribute('role', 'group');
	group.setAttribute('aria-label', field.label ?? field.name);

	(field.options ?? []).forEach((option, index) => {
		const optionId = `${fieldDomId(formId, field.name)}-${index}`;
		const input = document.createElement('input');
		const label = document.createElement('label');
		const optionValue = String(option.value ?? '');

		input.type = 'checkbox';
		input.id = optionId;
		input.name = name;
		input.value = optionValue;
		input.checked = selected.has(optionValue);
		input.disabled = field.disabled || processing || option.disabled;
		label.setAttribute('for', optionId);
		label.textContent = option.label;
		group.append(input, label);
	});

	return wrapField(context, group);
}

function toggleRenderer(context: FieldProps): HTMLElement {
	const wrapped = checkboxRenderer(context);
	const input = wrapped.querySelector<HTMLInputElement>('input[type="checkbox"]');

	if (input) {
		input.setAttribute('role', 'switch');
		input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
		input.addEventListener('change', () => {
			input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
		});
	}

	return wrapped;
}

function sliderRenderer(context: FieldProps): HTMLElement {
	const { field, value, errors, processing, formId } = context;
	const id = fieldDomId(formId, field.name);
	const message = messageFor(errors, field.name);
	const shell = document.createElement('div');
	const input = document.createElement('input');
	const output = document.createElement('output');

	input.type = 'range';
	input.id = id;
	input.name = field.htmlName;
	input.required = field.required;
	input.disabled = field.disabled || processing;
	input.value = sliderValue(value, field.attributes);
	applyAttributes(input, field);
	input.type = 'range';
	input.name = field.htmlName;
	output.htmlFor = id;
	output.textContent = input.value;
	input.addEventListener('input', () => {
		output.textContent = input.value;
	});

	const described = describedBy(field, formId, message !== '');
	if (described) {
		input.setAttribute('aria-describedby', described);
	}

	shell.append(input, output);

	return wrapField(context, shell);
}

function richTextRenderer(context: FieldProps): HTMLElement {
	const { field, value, errors, processing, formId } = context;
	const id = fieldDomId(formId, field.name);
	const message = messageFor(errors, field.name);
	const shell = document.createElement('div');
	const toolbar = document.createElement('div');
	const editor = document.createElement('div');
	const hidden = document.createElement('input');

	shell.className = 'if-rich-text';
	toolbar.setAttribute('role', 'toolbar');
	toolbar.setAttribute('aria-label', 'Formatting');

	for (const [label, tag] of [
		['Bold', 'strong'],
		['Italic', 'em'],
	] as const) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = label;
		button.disabled = field.disabled || processing;
		button.addEventListener('mousedown', (event) => event.preventDefault());
		button.addEventListener('click', () => {
			applyInlineFormat(editor, tag);
			hidden.value = editor.innerHTML;
		});
		toolbar.appendChild(button);
	}

	editor.id = id;
	editor.setAttribute('contenteditable', field.readonly || field.disabled || processing ? 'false' : 'true');
	editor.dataset.readonly = field.readonly ? 'true' : 'false';
	editor.setAttribute('role', 'textbox');
	editor.setAttribute('aria-multiline', 'true');
	editor.setAttribute('aria-label', field.label ?? field.name);
	editor.textContent = inputValue(value);

	hidden.type = 'hidden';
	hidden.name = field.htmlName;
	hidden.value = editor.innerHTML;

	editor.addEventListener('input', () => {
		hidden.value = editor.innerHTML;
	});

	const described = describedBy(field, formId, message !== '');
	if (described) {
		editor.setAttribute('aria-describedby', described);
	}

	shell.append(toolbar, editor, hidden);

	return wrapField(context, shell);
}

function childValue(row: Record<string, JsonValue>, name: string): JsonValue | undefined {
	if (Object.prototype.hasOwnProperty.call(row, name)) {
		return row[name];
	}

	const parts = name.split('.');
	let current: JsonValue | undefined = row;

	for (const part of parts) {
		if (!current || typeof current !== 'object' || Array.isArray(current)) {
			return undefined;
		}

		current = current[part];
	}

	return current;
}

function namedValues(scope: ParentNode, name: string): JsonValue {
	const nodes = [...scope.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${CSS.escape(name)}"]`)];
	const checkboxes = nodes.filter((node): node is HTMLInputElement => node instanceof HTMLInputElement && node.type === 'checkbox');

	if (name.endsWith('[]') && checkboxes.length > 0) {
		return checkboxes.filter((box) => box.checked).map((box) => box.value);
	}

	if (checkboxes.length === 1) {
		return checkboxes[0].checked;
	}

	const control = nodes.filter((node) => !(node instanceof HTMLInputElement && node.type === 'hidden')).at(-1) ?? nodes.at(-1);

	if (!control || (control instanceof HTMLInputElement && control.type === 'checkbox')) {
		return '';
	}

	if (control instanceof HTMLSelectElement && control.multiple) {
		return [...control.selectedOptions].map((option) => option.value);
	}

	return control.value;
}

function readRepeaterRows(body: HTMLElement, field: FieldPayload): Record<string, JsonValue>[] {
	return [...body.children].flatMap((child) => {
		if (!(child instanceof HTMLElement) || child.dataset.repeaterRow === undefined) {
			return [];
		}

		const index = Number(child.dataset.repeaterIndex ?? '0');
		const row: Record<string, JsonValue> = {};

		for (const nested of field.fields ?? []) {
			row[nested.name] = namedValues(child, repeaterChildField(field, index, nested).htmlName);
		}

		return [row];
	});
}

function repeaterRenderer(context: FieldProps, overrides: ComponentMap<FieldRenderer> = {}): HTMLElement {
	const { field } = context;
	let rows = objectRows(context.value);
	const body = document.createElement('div');
	body.className = 'if-repeater';

	const paint = (): void => {
		body.replaceChildren();

		rows.forEach((row, index) => {
			const rowEl = document.createElement('div');
			rowEl.dataset.repeaterRow = '';
			rowEl.dataset.repeaterIndex = String(index);

			for (const child of field.fields ?? []) {
				const scoped = repeaterChildField(field, index, child);
				rowEl.appendChild(renderField({
					field: scoped,
					value: childValue(row, child.name),
					errors: context.errors,
					processing: context.processing,
					formId: context.formId,
				}, overrides));
			}

			const remove = document.createElement('button');
			remove.type = 'button';
			remove.textContent = 'Remove row';
			remove.addEventListener('click', () => {
				const next = readRepeaterRows(body, field);
				next.splice(index, 1);
				rows = next;
				paint();
			});
			rowEl.appendChild(remove);
			body.appendChild(rowEl);
		});

		const add = document.createElement('button');
		add.type = 'button';
		add.textContent = 'Add row';
		add.addEventListener('click', () => {
			rows = [...readRepeaterRows(body, field), {}];
			paint();
		});
		body.appendChild(add);
	};

	paint();

	return wrapField(context, body);
}

function readBlockRows(body: HTMLElement, field: FieldPayload, current: BlockRow[]): BlockRow[] {
	return [...body.children]
		.filter((child): child is HTMLElement => child instanceof HTMLElement && child.dataset.blockRow !== undefined)
		.map((child, index) => {
			const row = current[index];
			const definition = blockDefinition(field, row?.type ?? child.dataset.blockType ?? '');
			const data: Record<string, JsonValue> = {};

			for (const nested of definition?.fields ?? []) {
				data[nested.name] = namedValues(child, blockChildField(field, index, nested).htmlName);
			}

			return { type: row?.type ?? child.dataset.blockType ?? '', data };
		});
}

function blocksRenderer(context: FieldProps, overrides: ComponentMap<FieldRenderer> = {}): HTMLElement {
	const { field, processing } = context;
	const definitions = field.blocks ?? [];
	let rows = blockRows(context.value);
	const body = document.createElement('div');
	const picker = document.createElement('select');
	const add = document.createElement('button');

	body.className = 'if-blocks';
	picker.setAttribute('aria-label', 'Block type');
	picker.disabled = field.disabled || processing;

	for (const definition of definitions) {
		const option = document.createElement('option');
		option.value = definition.type;
		option.textContent = definition.label;
		picker.appendChild(option);
	}

	add.type = 'button';
	add.textContent = 'Add block';
	add.disabled = definitions.length === 0 || field.disabled || processing;

	const paint = (): void => {
		body.querySelectorAll('[data-block-row]').forEach((node) => node.remove());

		rows.forEach((row, index) => {
			const definition = blockDefinition(field, row.type);
			const rowEl = document.createElement('div');
			const heading = document.createElement('p');
			const typeInput = document.createElement('input');
			const names = blockTypeName(field, index);

			rowEl.dataset.blockRow = '';
			rowEl.dataset.blockType = row.type;
			typeInput.type = 'hidden';
			typeInput.name = names.htmlName;
			typeInput.value = row.type;
			heading.textContent = definition?.label ?? row.type;

			const remove = document.createElement('button');
			remove.type = 'button';
			remove.textContent = 'Remove block';
			remove.addEventListener('click', () => {
				rows = readBlockRows(body, field, rows);
				rows.splice(index, 1);
				paint();
			});

			rowEl.append(typeInput, heading, remove);

			for (const child of definition?.fields ?? []) {
				const scoped = blockChildField(field, index, child);
				rowEl.appendChild(renderField({
					field: scoped,
					value: childValue(row.data, child.name),
					errors: context.errors,
					processing: context.processing,
					formId: context.formId,
				}, overrides));
			}

			body.appendChild(rowEl);
		});
	};

	add.addEventListener('click', () => {
		if (!picker.value) {
			return;
		}

		rows = [...readBlockRows(body, field, rows), { type: picker.value, data: {} }];
		paint();
	});

	paint();
	body.prepend(picker, add);

	return wrapField(context, body);
}

function readKeyValueRows(body: HTMLElement): KeyValueRow[] {
	return [...body.children].flatMap((child) => {
		if (!(child instanceof HTMLElement) || child.dataset.kvRow === undefined) {
			return [];
		}

		return [{
			key: child.querySelector<HTMLInputElement>('[data-kv="key"]')?.value ?? '',
			value: child.querySelector<HTMLInputElement>('[data-kv="value"]')?.value ?? '',
		}];
	});
}

function keyValueRenderer(context: FieldProps): HTMLElement {
	const { field, processing } = context;
	let rows = keyValueRows(context.value);
	const body = document.createElement('div');
	body.className = 'if-key-value';

	const paint = (): void => {
		body.replaceChildren();

		rows.forEach((row, index) => {
			const rowEl = document.createElement('div');
			const key = document.createElement('input');
			const cell = document.createElement('input');
			const names = keyValueNames(field, index);
			const remove = document.createElement('button');

			rowEl.dataset.kvRow = '';
			key.type = 'text';
			key.name = names.key;
			key.value = row.key;
			key.disabled = field.disabled || processing;
			key.dataset.kv = 'key';
			key.setAttribute('aria-label', `${field.label ?? field.name} key`);
			cell.type = 'text';
			cell.name = names.value;
			cell.value = row.value;
			cell.disabled = field.disabled || processing;
			cell.dataset.kv = 'value';
			cell.setAttribute('aria-label', `${field.label ?? field.name} value`);
			remove.type = 'button';
			remove.textContent = 'Remove row';
			remove.addEventListener('click', () => {
				const next = readKeyValueRows(body);
				next.splice(index, 1);
				rows = next;
				paint();
			});
			rowEl.append(key, cell, remove);
			body.appendChild(rowEl);
		});

		const add = document.createElement('button');
		add.type = 'button';
		add.textContent = 'Add row';
		add.addEventListener('click', () => {
			rows = [...readKeyValueRows(body), { key: '', value: '' }];
			paint();
		});
		body.appendChild(add);
	};

	paint();

	return wrapField(context, body);
}

function displayRenderer(context: FieldProps): HTMLElement {
	const { field } = context;
	const variant = renderDisplayVariant(displayVariant(field.variant));
	const wrapper = document.createElement('div');
	wrapper.className = 'if-field if-display';
	wrapper.dataset.field = field.name;
	wrapper.dataset.type = 'display';
	wrapper.dataset.variant = variant;

	switch (variant) {
		case 'heading': {
			const heading = document.createElement('h3');
			heading.textContent = field.label ?? '';
			wrapper.appendChild(heading);

			if (field.description) {
				const copy = document.createElement('p');
				copy.textContent = field.description;
				wrapper.appendChild(copy);
			}

			break;
		}
		case 'paragraph': {
			const copy = document.createElement('p');
			copy.textContent = field.label ?? '';
			wrapper.appendChild(copy);

			if (field.description) {
				const help = document.createElement('p');
				help.className = 'if-help';
				help.textContent = field.description;
				wrapper.appendChild(help);
			}

			break;
		}
		case 'divider': {
			wrapper.appendChild(document.createElement('hr'));

			if (field.label) {
				const caption = document.createElement('p');
				caption.textContent = field.label;
				wrapper.appendChild(caption);
			}

			break;
		}
		default: {
			const unexpected: never = variant;

			return unexpected;
		}
	}

	return wrapper;
}

function submitRenderer(context: FieldProps): HTMLElement {
	const { field, processing } = context;
	const wrapper = document.createElement('div');
	const button = document.createElement('button');

	wrapper.className = 'if-field';
	wrapper.dataset.field = field.name;
	wrapper.dataset.type = 'submit';
	button.type = 'submit';
	button.name = field.htmlName;
	button.value = field.label ?? 'Submit';
	button.textContent = field.label ?? 'Submit';
	button.disabled = field.disabled || processing;
	wrapper.appendChild(button);

	if (field.description) {
		const help = document.createElement('p');
		help.className = 'if-help';
		help.textContent = field.description;
		wrapper.appendChild(help);
	}

	return wrapper;
}
