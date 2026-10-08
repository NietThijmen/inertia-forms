<script lang="ts">
	import { fieldDomId, inputValue, otpLength } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	let digits = $state(readDigits());

	function readDigits(): string[] {
		return splitOtp(inputValue(value), otpLength(field));
	}
	let code = $derived(digits.join(''));

	function splitOtp(raw: string, size: number): string[] {
		return Array.from({ length: size }, (_, index) => raw[index] ?? '');
	}

	function onInput(index: number, event: Event): void {
		const box = event.currentTarget;

		if (!(box instanceof HTMLInputElement)) {
			return;
		}

		const char = box.value.slice(-1);
		const nextDigits = [...digits];
		nextDigits[index] = char;
		digits = nextDigits;
		box.value = char;

		const next = box.parentElement?.querySelectorAll('input[data-otp-box]')[index + 1];

		if (char !== '' && next instanceof HTMLInputElement) {
			next.focus();
		}
	}

	function onKeydown(index: number, event: KeyboardEvent): void {
		if (event.key !== 'Backspace' || digits[index] !== '') {
			return;
		}

		const boxes = event.currentTarget instanceof HTMLInputElement
			? event.currentTarget.parentElement?.querySelectorAll('input[data-otp-box]')
			: undefined;
		const previous = boxes?.[index - 1];

		if (previous instanceof HTMLInputElement) {
			previous.focus();
		}
	}

	function onPaste(event: ClipboardEvent): void {
		const text = event.clipboardData?.getData('text') ?? '';
		const chars = text.replace(/\s+/g, '').slice(0, digits.length).split('');

		if (chars.length === 0) {
			return;
		}

		event.preventDefault();
		digits = Array.from({ length: digits.length }, (_, index) => chars[index] ?? '');
	}
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(id, described)}
		<div
			role="group"
			aria-label={field.label ?? field.name}
			aria-describedby={described}
			onpaste={onPaste}
			{@attach (node) => {
				node.setAttribute('autocomplete', 'one-time-code');
			}}
		>
			<input type="hidden" name={field.htmlName} value={code} />
			{#each digits as digit, index (index)}
				<input
					type="text"
					id={index === 0 ? id : fieldDomId(formId, `${field.name}-${index}`)}
					data-otp-box=""
					maxlength="1"
					size="1"
					inputmode="numeric"
					value={digit}
					aria-label="{field.label ?? field.name} {index + 1}"
					disabled={field.disabled || processing}
					readonly={field.readonly}
					aria-invalid={errors[field.name] ? true : undefined}
					oninput={(event) => onInput(index, event)}
					onkeydown={(event) => onKeydown(index, event)}
				/>
			{/each}
		</div>
	{/snippet}
</FieldShell>
