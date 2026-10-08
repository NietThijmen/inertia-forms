import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FIELD_PAYLOAD_KEYS, FORM_PAYLOAD_KEYS, type FormPayload } from '../../../resources/js/contract';
import { getValue } from '../../../resources/js/core';

const fixturePath = resolve(dirname(fileURLToPath(import.meta.url)), '../../Fixtures/form-payload.json');

function loadFixture(): FormPayload {
	return JSON.parse(readFileSync(fixturePath, 'utf8')) as FormPayload;
}

describe('shared form payload contract', () => {
	it('loads a JSON-safe fixture with the documented keys', () => {
		const payload = loadFixture();

		expect(Object.keys(payload).sort()).toEqual([...FORM_PAYLOAD_KEYS].sort());
		expect(payload.id).toBe('profile-form');
		expect(payload.action).toBe('/profile');
		expect(payload.method).toBe('PUT');
		expect(payload.fields.length).toBeGreaterThan(0);

		for (const field of payload.fields) {
			for (const key of Object.keys(field)) {
				expect(FIELD_PAYLOAD_KEYS).toContain(key);
			}

			expect(field).not.toHaveProperty('rules');
			expect(field).not.toHaveProperty('serverRules');
		}

		expect(payload).not.toHaveProperty('rules');
		expect(payload).not.toHaveProperty('authorize');
		expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
	});

	it('exposes nested values through dotted names', () => {
		const payload = loadFixture();

		expect(getValue(payload.values, 'address.city')).toBe('Amsterdam');
		expect(getValue(payload.values, 'address.country')).toBe('NL');
		expect(getValue(payload.values, 'email')).toBe('jane@example.com');
	});
});
