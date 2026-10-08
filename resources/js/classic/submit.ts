import type { FormPayload } from '../contract';
import type { RouterLike } from './types';

function methodNeedsSpoofing(method: string): boolean {
	return !['GET', 'POST'].includes(method.toUpperCase());
}

export function applyNativeMethod(form: HTMLFormElement, method: string): void {
	const upper = method.toUpperCase();

	form.querySelectorAll('input[name="_method"]').forEach((node) => node.remove());

	if (methodNeedsSpoofing(upper)) {
		form.method = 'post';
		const spoof = document.createElement('input');
		spoof.type = 'hidden';
		spoof.name = '_method';
		spoof.value = upper;
		form.appendChild(spoof);
		return;
	}

	form.method = upper === 'GET' ? 'get' : 'post';
}

export function applyCsrfToken(form: HTMLFormElement): void {
	form.querySelectorAll('input[name="_token"]').forEach((node) => node.remove());

	const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

	if (!token) {
		return;
	}

	const input = document.createElement('input');
	input.type = 'hidden';
	input.name = '_token';
	input.value = token;
	form.appendChild(input);
}

export function resolveRouter(explicit?: RouterLike): RouterLike | null {
	if (explicit) {
		return explicit;
	}

	const candidate = (globalThis as { Inertia?: RouterLike }).Inertia;

	return candidate && typeof candidate.visit === 'function' ? candidate : null;
}

export function submitWithInertia(
	payload: FormPayload,
	form: HTMLFormElement,
	router: RouterLike,
	hooks: {
		setProcessing: (value: boolean) => void;
		setErrors: (errors: Record<string, string>) => void;
		setSuccessful: (value: boolean) => void;
	},
): void {
	if (!payload.action) {
		return;
	}

	const data = new FormData(form);

	router.visit(payload.action, {
		method: payload.method.toLowerCase(),
		data,
		forceFormData: true,
		onStart: () => {
			hooks.setProcessing(true);
			hooks.setSuccessful(false);
		},
		onFinish: () => hooks.setProcessing(false),
		onError: (errors) => hooks.setErrors(errors),
		onSuccess: () => {
			hooks.setErrors({});
			hooks.setSuccessful(true);
		},
	});
}
