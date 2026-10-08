<script lang="ts">
	import { setContext } from 'svelte';
	import { resolveComponent, type ComponentMap } from '../core';
	import type { FieldComponent, FieldProps, FieldRendererMap } from './types';
	import InputField from './fields/InputField.svelte';
	import TextareaField from './fields/TextareaField.svelte';
	import CheckboxField from './fields/CheckboxField.svelte';
	import SelectField from './fields/SelectField.svelte';
	import RadioField from './fields/RadioField.svelte';
	import FileField from './fields/FileField.svelte';
	import FallbackField from './fields/FallbackField.svelte';
	import SlugField from './fields/SlugField.svelte';
	import HiddenField from './fields/HiddenField.svelte';
	import OtpField from './fields/OtpField.svelte';
	import ComboboxField from './fields/ComboboxField.svelte';
	import CheckboxGroupField from './fields/CheckboxGroupField.svelte';
	import ToggleField from './fields/ToggleField.svelte';
	import SliderField from './fields/SliderField.svelte';
	import RichTextField from './fields/RichTextField.svelte';
	import RepeaterField from './fields/RepeaterField.svelte';
	import BlocksField from './fields/BlocksField.svelte';
	import KeyValueField from './fields/KeyValueField.svelte';
	import DisplayField from './fields/DisplayField.svelte';
	import SubmitField from './fields/SubmitField.svelte';

	type Props = FieldProps & {
		renderers?: FieldRendererMap;
	};

	let { renderers = {}, ...props }: Props = $props();

	const builtins: ComponentMap<FieldComponent> = {
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
		slug: SlugField,
		link: InputField,
		hidden: HiddenField,
		otp: OtpField,
		combobox: ComboboxField,
		'checkbox-group': CheckboxGroupField,
		toggle: ToggleField,
		time: InputField,
		color: InputField,
		slider: SliderField,
		composer: TextareaField,
		'rich-text': RichTextField,
		repeater: RepeaterField,
		blocks: BlocksField,
		'key-value': KeyValueField,
		display: DisplayField,
		submit: SubmitField,
	};

	let Renderer = $derived(resolveComponent(props.field.type, renderers, builtins, FallbackField));

	setContext('inertia-forms:renderers', () => renderers);
</script>

<Renderer {...props} />
