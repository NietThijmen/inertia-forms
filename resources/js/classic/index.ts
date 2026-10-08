import type { FormPayload } from '../contract';
import { errorList, fieldDomId, getValue, hasSubmitField, setValue, type FieldProps } from '../core';
import { defaultRenderers, renderField } from './fields';
import { applyCsrfToken, applyNativeMethod, resolveRouter, submitWithInertia } from './submit';
import type { ClassicFormHandle, FieldRenderer, MountClassicFormOptions } from './types';

export type { ClassicFormHandle, FieldProps, FieldRenderContext, FieldRenderer, MountClassicFormOptions, RouterLike } from './types';
export { defaultRenderers, renderField, resolveRenderer } from './fields';
export { fieldDomId, getValue, setValue };

function fieldErrors(errors: Record<string, string | string[]> | undefined): Record<string, string> {
	if (!errors) {
		return {};
	}

	const normalized: Record<string, string> = {};

	for (const name of Object.keys(errors)) {
		const message = errorList(errors, name)[0];

		if (message) {
			normalized[name] = message;
		}
	}

	return normalized;
}

export function mountClassicForm(
	target: Element,
	payload: FormPayload,
	options: MountClassicFormOptions = {},
): ClassicFormHandle {
	const form = document.createElement('form');
	form.className = 'if-form';
	form.dataset.formId = payload.id;
	form.noValidate = false;

	if (payload.action) {
		form.action = payload.action;
	}

	applyNativeMethod(form, payload.method);
	applyCsrfToken(form);

	if (payload.title) {
		const title = document.createElement('h2');
		title.textContent = payload.title;
		form.appendChild(title);
	}

	if (payload.description) {
		const description = document.createElement('p');
		description.className = 'if-form-description';
		description.textContent = payload.description;
		form.appendChild(description);
	}

	const fieldsRoot = document.createElement('div');
	fieldsRoot.className = 'if-fields';
	form.appendChild(fieldsRoot);

	const status = document.createElement('p');
	status.className = 'if-status';
	status.hidden = true;
	form.appendChild(status);

	const submit = hasSubmitField(payload.fields) ? null : document.createElement('button');

	if (submit) {
		submit.type = 'submit';
		submit.textContent = options.submitLabel ?? 'Submit';
		form.appendChild(submit);
	}

	target.replaceChildren(form);

	const renderers = { ...defaultRenderers(), ...options.renderers };
	const errors = fieldErrors(options.errors);
	let processing = false;

	for (const field of payload.fields) {
		const props: FieldProps = {
			field,
			value: getValue(payload.values, field.name),
			errors,
			processing: false,
			formId: payload.id,
		};

		fieldsRoot.appendChild(renderField(props, renderers));
	}

	const applyErrors = (errors: Record<string, string | string[]>): void => {
		for (const field of payload.fields) {
			const wrapper = Array.from(fieldsRoot.querySelectorAll<HTMLElement>('.if-field')).find(
				(element) => element.dataset.field === field.name,
			);
			const messages = errorList(errors, field.name);
			const errorNode = wrapper?.querySelector<HTMLElement>('.if-error');
			const control = wrapper?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea');

			if (errorNode) {
				errorNode.hidden = messages.length === 0;
				errorNode.textContent = messages[0] ?? '';
			}

			if (control) {
				if (messages.length > 0) {
					control.setAttribute('aria-invalid', 'true');
				} else {
					control.removeAttribute('aria-invalid');
				}
			}
		}
	};

	const applyProcessing = (value: boolean): void => {
		processing = value;

		if (submit) {
			submit.disabled = value;
			submit.textContent = value ? 'Submitting…' : (options.submitLabel ?? 'Submit');
		}

		form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement>(
			'input:not([type="hidden"]), select, textarea, button[type="submit"]',
		).forEach((element) => {
			element.disabled = value;
		});
		form.querySelectorAll<HTMLElement>('[contenteditable]').forEach((element) => {
			const readonly = element.dataset.readonly === 'true';
			element.setAttribute('contenteditable', value || readonly ? 'false' : 'true');
		});
	};

	const applySuccessful = (value: boolean): void => {
		status.hidden = !value;
		status.textContent = value ? 'Saved.' : '';
	};

	if (options.errors) {
		applyErrors(options.errors);
	}

	const mode = options.submit ?? 'auto';
	const router = resolveRouter(options.router);

	const onSubmit = (event: SubmitEvent): void => {
		if (processing) {
			event.preventDefault();
			return;
		}

		const intercepted = options.onSubmit?.(event, form);

		if (intercepted === false) {
			event.preventDefault();
			return;
		}

		const useInertia = mode === 'inertia' || (mode === 'auto' && router !== null);

		if (!useInertia || !router) {
			return;
		}

		event.preventDefault();
		submitWithInertia(payload, form, router, {
			setProcessing: applyProcessing,
			setErrors: applyErrors,
			setSuccessful: applySuccessful,
		});
	};

	form.addEventListener('submit', onSubmit);

	return {
		element: form,
		payload,
		destroy: () => {
			form.removeEventListener('submit', onSubmit);
			form.remove();
		},
		setErrors: applyErrors,
		setProcessing: applyProcessing,
		setSuccessful: applySuccessful,
	};
}

export function registerClassicRenderer(
	renderers: Record<string, FieldRenderer>,
	type: string,
	renderer: FieldRenderer,
): Record<string, FieldRenderer> {
	return { ...renderers, [type]: renderer };
}
