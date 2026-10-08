import type { FieldOption, FieldPayload, FormPayload, JsonValue } from '../../../resources/js/contract';

export function field(partial: Partial<FieldPayload> & Pick<FieldPayload, 'name' | 'type'>): FieldPayload {
	return {
		htmlName: partial.name,
		label: partial.name,
		description: null,
		placeholder: null,
		required: false,
		disabled: false,
		readonly: false,
		attributes: {},
		meta: {},
		...partial,
	};
}

export function options(...pairs: Array<[string, string]>): FieldOption[] {
	return pairs.map(([value, label]) => ({ value, label, disabled: false }));
}

export function form(fields: FieldPayload[], values: Record<string, JsonValue> = {}): FormPayload {
	return {
		id: 'demo',
		action: '/demo',
		method: 'POST',
		title: null,
		description: null,
		fields,
		values,
	};
}
