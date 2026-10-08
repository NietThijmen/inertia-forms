import type { JsonValue } from './contract';

export function getValue(
	values: Record<string, JsonValue>,
	dotted: string,
): JsonValue | undefined {
	return dotted.split('.').reduce<JsonValue | undefined>((acc, key) => {
		if (acc === null || acc === undefined || typeof acc !== 'object' || Array.isArray(acc)) {
			return undefined;
		}

		return acc[key];
	}, values);
}

export function setValue(
	values: Record<string, JsonValue>,
	dotted: string,
	value: JsonValue,
): Record<string, JsonValue> {
	const parts = dotted.split('.');
	const next: Record<string, JsonValue> = { ...values };
	let cursor: Record<string, JsonValue> = next;

	for (let index = 0; index < parts.length - 1; index += 1) {
		const key = parts[index];
		const child = cursor[key];

		if (child === null || typeof child !== 'object' || Array.isArray(child)) {
			cursor[key] = {};
		} else {
			cursor[key] = { ...child };
		}

		cursor = cursor[key] as Record<string, JsonValue>;
	}

	cursor[parts[parts.length - 1]] = value;

	return next;
}

export function inputValue(value: JsonValue | undefined): string {
	if (value === null || value === undefined || value === false) {
		return '';
	}

	if (value === true) {
		return '1';
	}

	if (typeof value === 'object') {
		return '';
	}

	return String(value);
}

export function isChecked(value: JsonValue | undefined): boolean {
	return value === true || value === 1 || value === '1' || value === 'on' || value === 'true';
}
