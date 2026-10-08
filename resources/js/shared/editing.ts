import { bracketHtmlName, htmlNameFromDotted, slugify } from '../core';

let listening = false;

function isSlugSource(
	target: EventTarget | null,
	from: string,
	slug: HTMLElement,
): target is HTMLInputElement | HTMLTextAreaElement {
	if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) || target === slug) {
		return false;
	}

	const expected = htmlNameFromDotted(from);
	const suffix = bracketHtmlName(expected);
	const row = slug.closest('[data-repeater-row], [data-block-row]');

	if (row) {
		return row.contains(target) && (target.name === expected || target.name.endsWith(suffix));
	}

	return target.name === expected;
}

function onDocumentInput(event: Event): void {
	const target = event.target;

	if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
		return;
	}

	if (target.dataset.slug === 'true') {
		target.dataset.slugTouched = 'true';
		const next = slugify(target.value);

		if (target.value !== next) {
			target.value = next;
		}

		return;
	}

	const form = target.form ?? target.closest('form');

	if (!form) {
		return;
	}

	form.querySelectorAll<HTMLInputElement>('input[data-slug="true"][data-slug-from]').forEach((slug) => {
		if (slug.dataset.slugTouched === 'true') {
			return;
		}

		const from = slug.dataset.slugFrom;

		if (!from || !isSlugSource(target, from, slug)) {
			return;
		}

		slug.value = slugify(target.value);
	});
}

export function bindSlugInput(input: HTMLInputElement, from: string | null): void {
	input.dataset.slug = 'true';

	if (from) {
		input.dataset.slugFrom = from;
	} else {
		delete input.dataset.slugFrom;
	}

	if (!listening) {
		listening = true;
		document.addEventListener('input', onDocumentInput, true);
	}

	queueMicrotask(() => {
		if (input.dataset.slugTouched === 'true' || input.value !== '' || !from) {
			return;
		}

		const form = input.form ?? input.closest('form');

		if (!form) {
			return;
		}

		const source = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')].find((element) =>
			isSlugSource(element, from, input),
		);

		if (!source) {
			return;
		}

		input.value = slugify(source.value);
	});
}

export function applyInlineFormat(root: HTMLElement, tagName: 'strong' | 'em'): void {
	const selection = root.ownerDocument.getSelection();

	if (!selection || selection.rangeCount === 0) {
		return;
	}

	const range = selection.getRangeAt(0);

	if (!root.contains(range.commonAncestorContainer)) {
		return;
	}

	const wrapper = root.ownerDocument.createElement(tagName);
	wrapper.appendChild(range.extractContents());
	range.insertNode(wrapper);
	selection.removeAllRanges();

	const next = root.ownerDocument.createRange();
	next.selectNodeContents(wrapper);
	selection.addRange(next);
}
