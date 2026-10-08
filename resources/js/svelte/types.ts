import type { Component } from 'svelte';
import type { ComponentMap, FieldProps } from '../core';
import type { FormPayload } from '../contract';

export type { FieldProps };

export type FieldComponent = Component<FieldProps>;

export type FieldRendererMap = ComponentMap<FieldComponent>;

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
