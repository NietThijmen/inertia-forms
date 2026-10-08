<script lang="ts">
	import { keyValueNames, keyValueRows, type KeyValueRow } from '../../core';
	import type { FieldProps } from '../types';
	import FieldShell from '../FieldShell.svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();

	type Row = KeyValueRow & { id: string };

	let sequence = 0;

	function uid(): string {
		sequence += 1;

		return `kv-${sequence}`;
	}

	let rows = $state<Row[]>(readRows());

	function readRows(): Row[] {
		return keyValueRows(value).map((row) => ({ ...row, id: uid() }));
	}

	function addRow(): void {
		rows = [...rows, { id: uid(), key: '', value: '' }];
	}

	function removeRow(id: string): void {
		rows = rows.filter((row) => row.id !== id);
	}
</script>

<FieldShell {field} {formId} {errors}>
	{#snippet children(_id, described)}
		<div class="if-key-value" aria-describedby={described}>
			{#each rows as row, index (row.id)}
				{@const names = keyValueNames(field, index)}
				<div data-kv-row="">
					<input
						type="text"
						name={names.key}
						bind:value={row.key}
						aria-label="{field.label ?? field.name} key"
						disabled={field.disabled || processing}
					/>
					<input
						type="text"
						name={names.value}
						bind:value={row.value}
						aria-label="{field.label ?? field.name} value"
						disabled={field.disabled || processing}
					/>
					<button type="button" onclick={() => removeRow(row.id)}>Remove row</button>
				</div>
			{/each}
			<button type="button" onclick={addRow}>Add row</button>
		</div>
	{/snippet}
</FieldShell>
