<script lang="ts">
	import type { FieldProps } from '../../../resources/js/core';

	let { field, value, errors, processing, formId }: FieldProps = $props();
</script>

<div
	data-testid="custom-email"
	data-form-id={formId}
	data-processing={String(processing)}
	data-error={errors[field.name] ?? ''}
	data-value={value ?? ''}
>
	{field.label}
</div>
