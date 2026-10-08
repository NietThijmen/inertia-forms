import type { ComponentMap, FieldProps } from '../core';
import type { FormPayload } from '../contract';

export type { FieldProps };

export type FieldRenderContext = FieldProps;

export type FieldRenderer = (context: FieldProps, overrides?: ComponentMap<FieldRenderer>) => HTMLElement;

export type RouterLike = {
	visit: (
		url: string,
		options: {
			method: string;
			data: FormData;
			forceFormData?: boolean;
			onStart?: () => void;
			onFinish?: () => void;
			onError?: (errors: Record<string, string>) => void;
			onSuccess?: () => void;
		},
	) => void;
};

export type MountClassicFormOptions = {
	renderers?: Record<string, FieldRenderer>;
	submit?: 'native' | 'inertia' | 'auto';
	router?: RouterLike;
	errors?: Record<string, string | string[]>;
	submitLabel?: string;
	onSubmit?: (event: SubmitEvent, form: HTMLFormElement) => boolean | void;
};

export type ClassicFormHandle = {
	element: HTMLFormElement;
	payload: FormPayload;
	destroy: () => void;
	setErrors: (errors: Record<string, string | string[]>) => void;
	setProcessing: (processing: boolean) => void;
	setSuccessful: (successful: boolean) => void;
};
