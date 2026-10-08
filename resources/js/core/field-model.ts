import type { BlockDefinition, FieldOption, FieldPayload, JsonValue } from './contract';
import { inputValue } from './values';

export type DisplayVariant = 'heading' | 'paragraph' | 'divider';

export type BlockRow = {
	type: string;
	data: Record<string, JsonValue>;
};

export type KeyValueRow = {
	key: string;
	value: string;
};

export function slugify(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

export function htmlNameFromDotted(name: string): string {
	const parts = name.split('.');
	const head = parts.shift() ?? name;

	return `${head}${parts.map((part) => `[${part}]`).join('')}`;
}

export function bracketHtmlName(htmlName: string): string {
	const arrayName = htmlName.endsWith('[]');
	const trimmed = arrayName ? htmlName.slice(0, -2) : htmlName;
	const parts = trimmed.replace(/\]/g, '').split('[').filter((part) => part !== '');
	const bracketed = parts.map((part) => `[${part}]`).join('');

	return arrayName ? `${bracketed}[]` : bracketed;
}

export function arrayHtmlName(htmlName: string): string {
	return htmlName.endsWith('[]') ? htmlName : `${htmlName}[]`;
}

export function repeaterChildField(parent: FieldPayload, index: number, child: FieldPayload): FieldPayload {
	return {
		...child,
		name: `${parent.name}.${index}.${child.name}`,
		htmlName: `${parent.htmlName}[${index}]${bracketHtmlName(child.htmlName)}`,
	};
}

export function blockChildField(parent: FieldPayload, index: number, child: FieldPayload): FieldPayload {
	return {
		...child,
		name: `${parent.name}.${index}.data.${child.name}`,
		htmlName: `${parent.htmlName}[${index}][data]${bracketHtmlName(child.htmlName)}`,
	};
}

export function blockTypeName(parent: FieldPayload, index: number): { name: string; htmlName: string } {
	return {
		name: `${parent.name}.${index}.type`,
		htmlName: `${parent.htmlName}[${index}][type]`,
	};
}

export function keyValueNames(parent: FieldPayload, index: number): { key: string; value: string } {
	return {
		key: `${parent.htmlName}[${index}][key]`,
		value: `${parent.htmlName}[${index}][value]`,
	};
}

export function displayVariant(value: string | null | undefined): DisplayVariant {
	switch (value) {
		case 'heading':
		case 'paragraph':
		case 'divider':
			return value;
		default:
			return 'paragraph';
	}
}

export function renderDisplayVariant(variant: DisplayVariant): DisplayVariant {
	switch (variant) {
		case 'heading':
		case 'paragraph':
		case 'divider':
			return variant;
		default: {
			const unexpected: never = variant;

			return unexpected;
		}
	}
}

export function otpLength(field: FieldPayload): number {
	const length = field.length;

	if (typeof length === 'number' && Number.isInteger(length) && length > 0) {
		return length;
	}

	return 6;
}

export function filterOptions(options: FieldOption[] | undefined, query: string): FieldOption[] {
	const list = options ?? [];
	const needle = query.trim().toLowerCase();

	if (needle === '') {
		return list;
	}

	return list.filter((option) => {
		const label = option.label.toLowerCase();
		const optionValue = option.value === null || option.value === undefined ? '' : String(option.value).toLowerCase();

		return label.includes(needle) || optionValue.includes(needle);
	});
}

export function optionLabelForValue(options: FieldOption[] | undefined, value: JsonValue | undefined): string {
	const current = inputValue(value);
	const match = (options ?? []).find((option) => String(option.value ?? '') === current);

	return match ? match.label : current;
}

export function objectRows(value: JsonValue | undefined): Record<string, JsonValue>[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.flatMap((item) => {
		if (item && typeof item === 'object' && !Array.isArray(item)) {
			return [item];
		}

		return [];
	});
}

export function blockRows(value: JsonValue | undefined): BlockRow[] {
	return objectRows(value).map((row) => {
		const data = row.data;

		return {
			type: typeof row.type === 'string' ? row.type : '',
			data: data && typeof data === 'object' && !Array.isArray(data) ? data : {},
		};
	});
}

export function keyValueRows(value: JsonValue | undefined): KeyValueRow[] {
	return objectRows(value).map((row) => ({
		key: cellText(row.key),
		value: cellText(row.value),
	}));
}

export function stringList(value: JsonValue | undefined): string[] {
	if (Array.isArray(value)) {
		return value.flatMap((item) => (item === null || typeof item === 'object' ? [] : [String(item)]));
	}

	if (value === null || value === undefined || value === '' || typeof value === 'object') {
		return [];
	}

	return [String(value)];
}

export function colorValue(value: JsonValue | undefined): string {
	const raw = inputValue(value);

	return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : '#000000';
}

export function sliderValue(value: JsonValue | undefined, attributes: FieldPayload['attributes']): string {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return String(value);
	}

	if (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value))) {
		return value;
	}

	const min = attributes.min;

	if (typeof min === 'number' || (typeof min === 'string' && min !== '')) {
		return String(min);
	}

	return '0';
}

export function hasSubmitField(fields: FieldPayload[]): boolean {
	return fields.some((field) => field.type === 'submit');
}

export function blockDefinition(field: FieldPayload, type: string): BlockDefinition | undefined {
	return (field.blocks ?? []).find((block) => block.type === type);
}

function cellText(value: JsonValue | undefined): string {
	if (value === null || value === undefined || typeof value === 'object') {
		return '';
	}

	return String(value);
}
