<script lang="ts">
	import { getContext } from 'svelte';
	import { blockChildField, blockDefinition, blockRows, blockTypeName, type JsonValue } from '../../core';
	import type { FieldProps, FieldRendererMap } from '../types';
	import Field from '../Field.svelte';
	import FieldShell from '../FieldShell.svelte';

	type Row = {
		id: string;
		type: string;
		data: Record<string, JsonValue>;
	};

	let { field, value, errors, processing, formId }: FieldProps = $props();

	const renderers = getContext<(() => FieldRendererMap) | undefined>('inertia-forms:renderers')?.() ?? {};

	let sequence = 0;

	function uid(): string {
		sequence += 1;

		return `block-${sequence}`;
	}

	let rows = $state<Row[]>(readRows());
	let choice = $state(readChoice());

	function readRows(): Row[] {
		return blockRows(value).map((row) => ({ id: uid(), type: row.type, data: row.data }));
	}

	function readChoice(): string {
		return field.blocks?.[0]?.type ?? '';
	}

	let body = $state<HTMLDivElement | undefined>(undefined);

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
			return rows.map((row) => ({ ...row, data: { ...row.data } }));
		}

		const elements = [...body.querySelectorAll<HTMLElement>(':scope > [data-block-row]')];

		return elements.map((rowEl, index) => {
			const current = rows[index];
			const definition = blockDefinition(field, current?.type ?? '');
			const data: Record<string, JsonValue> = {};

			for (const child of definition?.fields ?? []) {
				const name = blockChildField(field, index, child).htmlName;
				const control = rowEl.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
					`[name="${CSS.escape(name)}"]`,
				);
				data[child.name] = control ? control.value : '';
			}

			return { id: current?.id ?? uid(), type: current?.type ?? '', data };
		});
	}

	function addBlock(): void {
		if (choice === '') {
			return;
		}

		rows = [...snapshot(), { id: uid(), type: choice, data: {} }];
	}

	function removeBlock(id: string): void {
		rows = snapshot().filter((row) => row.id !== id);
	}
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(_id, described)}
		<div class="if-blocks" aria-describedby={described}>
			<select aria-label="Block type" bind:value={choice} disabled={field.disabled || processing}>
				{#each field.blocks ?? [] as definition (definition.type)}
					<option value={definition.type}>{definition.label}</option>
				{/each}
			</select>
			<button type="button" onclick={addBlock} disabled={(field.blocks ?? []).length === 0 || field.disabled || processing}>
				Add block
			</button>
			<div {@attach trackBody}>
				{#each rows as row, index (row.id)}
					{@const definition = blockDefinition(field, row.type)}
					{@const typeName = blockTypeName(field, index)}
					<div data-block-row="" data-block-type={row.type}>
						<input type="hidden" name={typeName.htmlName} value={row.type} />
						<p>{definition?.label ?? row.type}</p>
						{#each definition?.fields ?? [] as child (child.name)}
							{@const scoped = blockChildField(field, index, child)}
							<Field
								field={scoped}
								value={row.data[child.name]}
								{errors}
								{processing}
								{formId}
								{renderers}
							/>
						{/each}
						<button type="button" onclick={() => removeBlock(row.id)}>Remove block</button>
					</div>
				{/each}
			</div>
		</div>
	{/snippet}
</FieldShell>
