import { describe, expect, it } from 'vitest';
import { resolveComponent, type ComponentMap } from '../../../resources/js/core';

describe('resolveComponent', () => {
	const builtins: ComponentMap<string> = {
		email: 'builtin-email',
		text: 'builtin-text',
	};
	const fallback = 'fallback';

	it('prefers a custom component over the built-in', () => {
		expect(resolveComponent('email', { email: 'custom-email' }, builtins, fallback)).toBe('custom-email');
	});

	it('uses the built-in when that type has no custom component', () => {
		expect(resolveComponent('email', { text: 'custom-text' }, builtins, fallback)).toBe('builtin-email');
	});

	it('uses the fallback when the type is not registered', () => {
		expect(resolveComponent('color', {}, builtins, fallback)).toBe('fallback');
	});
});
