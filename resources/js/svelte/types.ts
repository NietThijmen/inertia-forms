import type { Component } from 'svelte';
import type { FieldPayload, FormPayload, JsonValue } from '../contract';

export type FieldProps = {
	field: FieldPayload;
	value: JsonValue | undefined;
	errors: Record<string, string>;
	processing: boolean;
	formId: string;
};

export type FieldComponent = Component<FieldProps>;

export type FieldRendererMap = Record<string, FieldComponent>;

export type InertiaFormState = {
	errors: Record<string, string>;
	hasErrors: boolean;
	processing: boolean;
	progress: { percentage: number } | null;
	wasSuccessful: boolean;
	recentlySuccessful: boolean;
	isDirty: boolean;
	setError: (...args: never[]) => void;
	clearErrors: (...args: never[]) => void;
	resetAndClearErrors: (...args: never[]) => void;
	defaults: () => void;
	reset: (...args: never[]) => void;
	submit: () => void;
	cancel: () => void;
};

export type FormRenderContext = InertiaFormState & {
	payload: FormPayload;
};
