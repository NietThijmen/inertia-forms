# inertia-forms

Class-based Laravel forms serialized into one JSON-safe contract, rendered by a Classic (HTML/JavaScript) adapter or a Svelte adapter for Inertia.js.

This repository is a Composer package (`nietthijmen/inertia-forms`) plus an npm package (`@nietthijmen/inertia-forms`). Frontend entry points are `./contract`, `./core`, `./classic`, and `./svelte`. Persistence stays in the consuming application.

**Classic** here means a framework-agnostic renderer built on semantic HTML and browser APIs. It is not a Vue/React adapter and does not require a CSS framework.

## Requirements

- PHP 8.3+
- Laravel 12 or 13
- Inertia.js 2 or 3 when using Inertia submissions
- Svelte 5 when using the Svelte adapter (`@inertiajs/svelte` 2 or 3)

## Installation

```bash
composer require nietthijmen/inertia-forms
npm install @nietthijmen/inertia-forms
```

Laravel auto-discovers `NietThijmen\InertiaForms\InertiaFormsServiceProvider`. Publish the optional config:

```bash
php artisan vendor:publish --tag=inertia-forms-config
```

The Svelte adapter is a peer of `svelte` and `@inertiajs/svelte`. The Classic adapter has no required frontend framework. If `@inertiajs/core` / `window.Inertia` is present, Classic can enhance submits through Inertia.

## Define a form class

```php
use Illuminate\Http\Request;
use NietThijmen\InertiaForms\Fields\EmailField;
use NietThijmen\InertiaForms\Fields\TextField;
use NietThijmen\InertiaForms\Form;

final class ProfileForm extends Form
{
    public function fields(): array
    {
        return [
            TextField::make('name')->label('Name')->required(),
            EmailField::make('email')->label('Email'),
        ];
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
        ];
    }

    public function initialValues(): array
    {
        return [
            'name' => '',
            'email' => '',
        ];
    }

    public function authorize(Request $request): bool
    {
        return $request->user() !== null;
    }
}
```

`required()` on a field is a display hint (label/asterisk/HTML `required`). It does not add a Laravel validation rule. Put rules in `rules()` or on the field with `->rules([...])` — those server rules are never serialized.

### Built-in fields

`TextField`, `EmailField`, `PasswordField`, `NumberField`, `DateField`, `TextareaField`, `CheckboxField`, `SelectField`, `RadioField`, `FileField`, `SlugField`, `LinkField`, `HiddenField`, `OtpField`, `ComboboxField`, `CheckboxGroupField`, `ToggleField`, `TimeField`, `ColorField`, `SliderField`, `ComposerField`, `RichTextField`, `RepeaterField`, `BlocksField`, `KeyValueField`, `DisplayField`, `SubmitField`.

Common metadata: `label()`, `description()`, `placeholder()`, `default()`, `required()`, `disabled()`, `readonly()`, `attributes()` / `attribute()`, `meta()`.

Select, radio, combobox, and checkbox group: `options(['admin' => 'Admin'])` or `[['value' => 'admin', 'label' => 'Admin']]`. File: `accept()`, `multiple()`. Number and slider: `min()`, `max()`, `step()`. Slug: `from('title')`. OTP: `length(6)`. Repeater: `fields([...])`. Blocks: `blocks(['hero' => ['label' => 'Hero', 'fields' => [...]]])`. Display: `variant('heading')`, `variant('paragraph')`, or `variant('divider')`. Toggle uses the same checked values as a checkbox and renders `role="switch"`. A `SubmitField` replaces the form's default submit button. Composer is a plain textarea. Rich text is a `contenteditable` with bold and italic only.

### Values, nulls, and models

Highest priority wins:

1. `withValues([...])`
2. `Form::make($model)` / `fill($source)` (skipped for password and file unless `fillFromSource(true)`)
3. `initialValues()`
4. Field `default()`
5. Type default (`''`, `false` for checkbox and toggle, `[]` for checkbox group, repeater, blocks, and key-value, `null` for number/date/time/slider/file, `#000000` for color)

`null` is kept as JSON `null`. A missing key falls through. An empty string is a real value. Nested names such as `address.city` become nested objects in `values` and `address[city]` in HTML.

`fill($model)` reads only declared field names. It never calls `toArray()` on the model, so hidden attributes and relations that are not fields do not leak.

File inputs are always `null` in the payload. Use `meta('current', $filename)` to show an existing file name.

See [docs/payload-contract.md](docs/payload-contract.md) for the full schema.

## Pass the form to Inertia

```php
$form = ProfileForm::make($request->user())
    ->withAction(route('profile.update'), 'PUT');

return Inertia::render('Profile/Edit', [
    'form' => $form->toInertia(),
]);
```

`$form` is `JsonSerializable`, so `Inertia::render(..., ['form' => $form])` also works. The payload does not include Svelte- or Classic-specific props.

## Validate a submission

```php
public function update(Request $request)
{
    $data = ProfileForm::make()->validate($request);

    $request->user()->update($data);

    return back();
}
```

`validate($request)`:

1. Calls `authorize($request)` and throws `Illuminate\Auth\Access\AuthorizationException` on `false` (HTTP 403).
2. Validates with Laravel’s validator using **server** rules, not anything posted by the browser.
3. Throws `Illuminate\Validation\ValidationException` on failure, including the form’s `errorBag()`. Inertia’s normal redirect/error-bag flow is unchanged.
4. Returns `validated()` data. The package never writes to the database.

A fuller controller example lives in `examples/ProfileController.php`.

## Classic adapter

```js
import { mountClassicForm } from '@nietthijmen/inertia-forms/classic';

const handle = mountClassicForm(document.getElementById('profile-form'), payload, {
  submit: 'auto', // 'native' | 'inertia' | 'auto'
  submitLabel: 'Save',
  renderers: {
    color: ({ field, value, errors }) => {
      const input = document.createElement('input');
      input.type = 'color';
      input.name = field.htmlName;
      input.value = String(value ?? '#000000');
      input.setAttribute('aria-invalid', errors[field.name] ? 'true' : 'false');
      return input;
    },
  },
});

handle.setErrors({ name: 'Required' });
handle.destroy();
```

Behavior:

- Renders labels, help text, inputs, and `role="alert"` errors.
- Nested names use `address[city]`.
- Native submit uses a real HTML form. `PUT`/`PATCH`/`DELETE` are spoofed with `_method` and POST. A CSRF token is added from `meta[name="csrf-token"]` when present.
- `submit: 'inertia'` (or `auto` when `window.Inertia` or `options.router` exists) intercepts submit and calls Inertia `router.visit` with `FormData`. Validation errors then come from Inertia’s `onError` callback / page reload — the same redirect-based flow Inertia already uses.
- Native HTML submit is implemented and tested as “the browser posts `FormData` to `action`”. It is **not** claimed to complete an Inertia validation round-trip without JavaScript. Inertia responses require the Inertia client (or a classic Laravel non-Inertia redirect back).

Each classic renderer receives `FieldProps`: `field`, `value`, `errors` (`Record<string, string>`), `processing`, and `formId`. `mountClassicForm({ errors })` still accepts a string or a list of strings per field and keeps the first message.

Manual rendering: skip `mountClassicForm` and call `renderField({ field, value, errors, processing, formId })` for each field, or pass renderer overrides. See `examples/classic.js`.

## Svelte adapter

```svelte
<script>
	import { Form, Field } from '@nietthijmen/inertia-forms/svelte';

	let { form } = $props();
</script>

<Form payload={form} submitLabel="Save" />
```

The component wraps Inertia’s `<Form>` (`@inertiajs/svelte` v3 `Form` / `useForm` family). Named inputs, files, nested names, `processing`, `errors`, and `wasSuccessful` follow the current Inertia form API.

### Manual fields and overrides

```svelte
<Form payload={form}>
	{#snippet field({ field, value, errors, processing })}
		{#if field.name === 'bio'}
			<MyEditor name={field.htmlName} {value} />
		{:else}
			<Field {field} {value} {errors} {processing} formId={form.id} />
		{/if}
	{/snippet}
</Form>
```

Replace a type for the whole form. `renderers` and `components` use the same field-component map. Keys in `components` win:

```svelte
<script lang="ts">
	import { Form } from '@nietthijmen/inertia-forms/svelte';
	import EmailNote from './EmailNote.svelte';
	import MyMarkdown from './MyMarkdown.svelte';

	let { form } = $props();
</script>

<Form payload={form} components={{ email: EmailNote }} renderers={{ textarea: MyMarkdown }} />
```

```svelte
<script lang="ts">
	import type { FieldProps } from '@nietthijmen/inertia-forms/svelte';

	let { field, value, errors, processing, formId }: FieldProps = $props();
</script>

<p data-field={field.name} data-form={formId}>
	{field.label}: {value}
	{#if errors[field.name]}
		<span role="alert">{errors[field.name]}</span>
	{/if}
	{#if processing}Saving…{/if}
</p>
```

`FieldProps` and the framework-free helpers live in `@nietthijmen/inertia-forms/core`:

```ts
import {
	getValue,
	resolveComponent,
	type FieldPayload,
	type FieldProps,
} from '@nietthijmen/inertia-forms/core';
```

React and Vue adapters are not included yet. They would render each field with the same `FieldProps` (`field`, `value`, `errors`, `processing`, `formId`).

`renderers` replaces one type for the whole form:

```svelte
<Form payload={form} renderers={{ textarea: MyMarkdown }} />
```

Fully manual:

```svelte
<Form payload={form}>
	{#snippet children({ errors, processing, payload })}
		<input name="name" value={payload.values.name} />
		<button type="submit" disabled={processing}>Save</button>
	{/snippet}
</Form>
```

Styling is left to the application. Markup uses `if-field` / `if-error` hooks only.

## Custom PHP field types

```php
use NietThijmen\InertiaForms\Fields\Field;

final class ColorField extends Field
{
    public function type(): string
    {
        return 'color';
    }
}
```

Register a Classic renderer or Svelte component for `color`. Extra presentation data goes in `meta()` or `attributes()`. Do not put closures, models, or rules there — unsafe values are dropped.

## Known limitations

- No layout/grid/repeater system in this MVP.
- No Precognition, client-side rule mirroring, or autosave.
- Password and file fields are not filled from models by default.
- Classic native submit is ordinary HTML. Inertia error/processing UI needs the Inertia client.
- Custom field types need a matching frontend renderer or they fall back to a text input.
- Compatible with Laravel 12–13, Inertia 2–3, Svelte 5. Older stacks are untested.

## Demo

[`demo/`](demo/README.md) is a small Laravel, Inertia, and Svelte app with one sign-in screen. It consumes this package through a Composer path repository and an npm `file:` link.

## Development

```bash
composer install
composer test
composer lint
composer analyse
npm install
npm test
npm run typecheck
npm run build
```
