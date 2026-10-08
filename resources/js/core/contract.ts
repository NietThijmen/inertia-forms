export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue };

export type FieldOption = {
	value: string | number | boolean | null;
	label: string;
	disabled: boolean;
};

export type FieldPayload = {
	name: string;
	htmlName: string;
	type: string;
	label: string | null;
	description: string | null;
	placeholder: string | null;
	required: boolean;
	disabled: boolean;
	readonly: boolean;
	attributes: Record<string, string | number | boolean | null>;
	meta: Record<string, JsonValue>;
	options?: FieldOption[];
	multiple?: boolean;
	accept?: string | null;
};

export type FormPayload = {
	id: string;
	action: string | null;
	method: string;
	title: string | null;
	description: string | null;
	fields: FieldPayload[];
	values: Record<string, JsonValue>;
};

export const FORM_PAYLOAD_KEYS = [
	'id',
	'action',
	'method',
	'title',
	'description',
	'fields',
	'values',
] as const;

export const FIELD_PAYLOAD_KEYS = [
	'name',
	'htmlName',
	'type',
	'label',
	'description',
	'placeholder',
	'required',
	'disabled',
	'readonly',
	'attributes',
	'meta',
	'options',
	'multiple',
	'accept',
] as const;
