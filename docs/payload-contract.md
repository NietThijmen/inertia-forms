# Shared payload contract

Both the Classic and Svelte adapters consume the JSON returned by `Form::toInertia()`. The browser must treat this object as display and initialization data only. Laravel remains the source of truth for validation and authorization.

The fixture at `tests/Fixtures/form-payload.json` is the canonical example. PHP and JavaScript tests both assert against it.

## Form object

| Key | Type | Description |
| --- | --- | --- |
| `id` | `string` | Stable identifier derived from the form class basename (`ProfileForm` → `profile-form`). Override with `id()`. |
| `action` | `string \| null` | Submit URL when provided by the consumer. |
| `method` | `string` | Uppercase HTTP method. Defaults to `POST`. |
| `title` | `string \| null` | Optional form heading. |
| `description` | `string \| null` | Optional form-level help text. |
| `fields` | `Field[]` | Field definitions in display order. |
| `values` | `object` | Nested initial values keyed to field names. |

No other form-level keys are serialized.

## Field object

| Key | Type | Description |
| --- | --- | --- |
| `name` | `string` | Laravel dotted name, e.g. `address.city`. |
| `htmlName` | `string` | HTML name, e.g. `address[city]`. |
| `type` | `string` | Renderer hint: `text`, `email`, `password`, `number`, `date`, `textarea`, `checkbox`, `select`, `radio`, `file`, or a custom type. |
| `label` | `string \| null` | Accessible label. |
| `description` | `string \| null` | Help text. |
| `placeholder` | `string \| null` | Placeholder hint. |
| `required` | `boolean` | Presentation hint only. Not a validation rule. |
| `disabled` | `boolean` | Disable the control. |
| `readonly` | `boolean` | Read-only for supported controls. |
| `attributes` | `object` | Scalar HTML attributes. Event handlers and `javascript:` URLs are stripped. |
| `meta` | `object` | JSON-safe extra presentation data. |
| `options` | `array` | Present for `select` and `radio`: `{ value, label, disabled }`. |
| `multiple` | `boolean` | Present for `select` and `file` when relevant. |
| `accept` | `string \| null` | Present for `file`. |

Never present: Laravel rules, closures, authorization logic, the backing model, secrets, or PHP objects.

## Values

Priority, highest first:

1. `withValues()`
2. `fill($source)` / `Form::make($source)` for fields with `fillFromSource()` (off by default for password and file)
3. `initialValues()`
4. Field `default()`
5. Type default: `''` for text-like fields, `false` for checkbox, `[]` for multi-select, `null` for number, date, and file

Rules:

- `null` is preserved and encoded as JSON `null`.
- Missing keys fall through to the next source.
- Empty strings are values, not missing keys.
- File values are always `null` in the payload. Put a display name in `meta.current` if needed.
- Nested names become nested objects (`address.city` → `values.address.city`).
- DateTime values become `Y-m-d` for `date` fields.

## Frontend submission

Adapters submit ordinary field values (and files) to `action` using `method`. They must not post the field definition array back as authoritative configuration.
