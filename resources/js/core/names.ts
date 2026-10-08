import type { FieldPayload } from './contract';

export function fieldDomId(formId: string, name: string): string {
	return `if-${formId}-${name.replace(/[^a-zA-Z0-9_-]+/g, '-')}`;
}

export function errorList(errors: Record<string, string | string[]> | undefined, name: string): string[] {
	if (!errors) {
		return [];
	}

	const value = errors[name];

	if (Array.isArray(value)) {
		return value.filter((item) => item !== '');
	}

	return value ? [value] : [];
}

export function describedBy(field: FieldPayload, formId: string, hasError: boolean): string | undefined {
	const id = fieldDomId(formId, field.name);
	const parts: string[] = [];

	if (field.description) {
		parts.push(`${id}-help`);
	}

	if (hasError) {
		parts.push(`${id}-error`);
	}

	return parts.length > 0 ? parts.join(' ') : undefined;
}

export function omitUndefined<T extends Record<string, unknown>>(value: T): T {
	return Object.fromEntries(
		Object.entries(value).filter(([, item]) => item !== undefined),
	) as T;
}

export function asRecord<T extends Record<string, unknown>>(value: T | unknown[] | null | undefined): T {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return value;
	}

	return {} as T;
}
