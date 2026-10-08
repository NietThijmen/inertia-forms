import type { FieldPayload } from '../contract';
import {
	asRecord,
	describedBy,
	errorList,
	fieldDomId,
	inputValue,
	isChecked,
	resolveComponent,
	type ComponentMap,
	type FieldProps,
} from '../core';
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

	if (field.type !== 'checkbox' && field.type !== 'radio') {
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

function inputRenderer(htmlType: string): FieldRenderer {
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
			input.value = inputValue(value);
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
	return resolveRenderer(context.field.type, overrides)(context);
}
