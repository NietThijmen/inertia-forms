import type { FieldPayload, JsonValue } from './contract';

export type FieldProps = {
	field: FieldPayload;
	value: JsonValue | undefined;
	errors: Record<string, string>;
	processing: boolean;
	formId: string;
};

export type FieldShellProps = {
	field: FieldPayload;
	formId: string;
	errors: Record<string, string>;
	hideLabel?: boolean;
};
