<script lang="ts">
	import { getContext } from 'svelte';
	import { objectRows, repeaterChildField, type JsonValue } from '../../core';
	import type { FieldProps, FieldRendererMap } from '../types';
	import Field from '../Field.svelte';
	import FieldShell from '../FieldShell.svelte';

	type Row = {
		id: string;
		data: Record<string, JsonValue>;
	};

	let { field, value, errors, processing, formId }: FieldProps = $props();

	const renderers = getContext<(() => FieldRendererMap) | undefined>('inertia-forms:renderers')?.() ?? {};

	let sequence = 0;

	function uid(): string {
		sequence += 1;

		return `rep-${sequence}`;
	}

	let rows = $state<Row[]>(readRows());
	let body = $state<HTMLDivElement | undefined>(undefined);

	function readRows(): Row[] {
		return objectRows(value).map((data) => ({ id: uid(), data }));
	}

	function trackBody(node: HTMLDivElement): () => void {
		body = node;

		return () => {
			if (body === node) {
				body = undefined;
			}
		};
	}

	function snapshot(): Row[] {
		if (!body) {
			return rows.map((row) => ({ id: row.id, data: { ...row.data } }));
		}

		const elements = [...body.querySelectorAll<HTMLElement>(':scope > [data-repeater-row]')];

		return elements.map((rowEl, index) => {
			const current = rows[index];
			const data: Record<string, JsonValue> = {};

			for (const child of field.fields ?? []) {
				const name = repeaterChildField(field, index, child).htmlName;
				const control = rowEl.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
					`[name="${CSS.escape(name)}"]`,
				);
				data[child.name] = control ? control.value : '';
			}

			return { id: current?.id ?? uid(), data };
		});
	}

	function addRow(): void {
		rows = [...snapshot(), { id: uid(), data: {} }];
	}

	function removeRow(id: string): void {
		const current = snapshot();
		rows = current.filter((row) => row.id !== id);
	}
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(_id, described)}
		<div class="if-repeater" aria-describedby={described} {@attach trackBody}>
			{#each rows as row, index (row.id)}
				<div data-repeater-row="">
					{#each field.fields ?? [] as child (child.name)}
						{@const scoped = repeaterChildField(field, index, child)}
						<Field
							field={scoped}
							value={row.data[child.name]}
							{errors}
							{processing}
							{formId}
							{renderers}
						/>
					{/each}
					<button type="button" onclick={() => removeRow(row.id)}>Remove row</button>
				</div>
			{/each}
			<button type="button" onclick={addRow}>Add row</button>
		</div>
	{/snippet}
</FieldShell>
