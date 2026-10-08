<script lang="ts">
	import type { Component } from 'svelte';
	import type { FieldProps, FieldRendererMap } from './types';
	import InputField from './fields/InputField.svelte';
	import TextareaField from './fields/TextareaField.svelte';
	import CheckboxField from './fields/CheckboxField.svelte';
	import SelectField from './fields/SelectField.svelte';
	import RadioField from './fields/RadioField.svelte';
	import FileField from './fields/FileField.svelte';
	import FallbackField from './fields/FallbackField.svelte';

	type Props = FieldProps & {
		renderers?: FieldRendererMap;
	};

	let { renderers = {}, ...props }: Props = $props();

	const builtins: Record<string, Component<FieldProps>> = {
		text: InputField,
		email: InputField,
		password: InputField,
		number: InputField,
		date: InputField,
		textarea: TextareaField,
		checkbox: CheckboxField,
		select: SelectField,
		radio: RadioField,
		file: FileField,
	};

	let Renderer = $derived(renderers[props.field.type] ?? builtins[props.field.type] ?? FallbackField);
</script>

<Renderer {...props} />
