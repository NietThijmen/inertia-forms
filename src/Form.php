<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms;

use BackedEnum;
use DateTimeInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use JsonSerializable;
use NietThijmen\InertiaForms\Fields\Field;
use NietThijmen\InertiaForms\Support\JsonSafe;
use NietThijmen\InertiaForms\Support\Values;
use Stringable;

/**
 * @implements Arrayable<string, mixed>
 */
abstract class Form implements Arrayable, JsonSerializable
{
    protected mixed $source = null;

    /**
     * @var array<array-key, mixed>
     */
    protected array $explicitValues = [];

    protected ?string $actionUrl = null;

    protected ?string $httpMethod = null;

    public function __construct(protected ?Request $request = null) {}

    public static function make(mixed $source = null): static
    {
        /** @var static $form */
        $form = app(static::class);

        if ($source !== null) {
            $form->fill($source);
        }

        return $form;
    }

    /**
     * @return list<Field>
     */
    abstract public function fields(): array;

    /**
     * Laravel validation rules. These are never serialized to the frontend.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [];
    }

    /**
     * @return array<string, string>
     */
    public function validationAttributes(): array
    {
        return [];
    }

    /**
     * Explicit initial values for the form. Nested arrays and dotted keys are both supported.
     *
     * @return array<array-key, mixed>
     */
    public function initialValues(): array
    {
        return [];
    }

    /**
     * Return false to reject the request with Laravel's AuthorizationException (HTTP 403).
     */
    public function authorize(Request $request): bool
    {
        return true;
    }

    public function errorBag(): string
    {
        return 'default';
    }

    public function id(): string
    {
        $basename = class_basename(static::class);

        return strtolower((string) preg_replace('/(?<!^)[A-Z]/', '-$0', $basename));
    }

    public function title(): ?string
    {
        return null;
    }

    public function description(): ?string
    {
        return null;
    }

    public function action(): ?string
    {
        return $this->actionUrl;
    }

    public function method(): string
    {
        $method = $this->httpMethod
            ?? (function_exists('config') ? config('inertia-forms.default_method', 'POST') : 'POST');

        return strtoupper((string) $method);
    }

    /**
     * Initialize field values from a model, array, or ArrayAccess object.
     * Only declared field names are read; the full source is never serialized.
     */
    public function fill(mixed $source): static
    {
        $this->source = $source;

        return $this;
    }

    /**
     * Highest-priority values. Nested arrays and dotted keys are supported.
     *
     * @param  array<array-key, mixed>  $values
     */
    public function withValues(array $values): static
    {
        $this->explicitValues = $values;

        return $this;
    }

    public function withAction(?string $url, string $method = 'POST'): static
    {
        $this->actionUrl = $url;
        $this->httpMethod = strtoupper($method);

        return $this;
    }

    public function authorizeRequest(Request $request): void
    {
        if (! $this->authorize($request)) {
            throw new AuthorizationException('This action is unauthorized.');
        }
    }

    /**
     * Authorize the request, then validate submitted input with Laravel's validator.
     * Persistence is left to the caller.
     *
     * @return array<string, mixed>
     *
     * @throws AuthorizationException
     * @throws ValidationException
     */
    public function validate(Request $request): array
    {
        $this->authorizeRequest($request);

        $validator = Validator::make(
            $request->all(),
            $this->compiledRules(),
            $this->messages(),
            $this->validationAttributes(),
        );

        if ($validator->fails()) {
            throw (new ValidationException($validator))->errorBag($this->errorBag());
        }

        return $validator->validated();
    }

    /**
     * @return array<string, mixed>
     */
    public function compiledRules(): array
    {
        $rules = [];

        foreach ($this->fields() as $field) {
            $fieldRules = $field->serverRules();

            if ($fieldRules !== []) {
                $rules[$field->name()] = $fieldRules;
            }
        }

        return array_replace($rules, $this->rules());
    }

    /**
     * JSON-safe payload shared by Classic and Svelte adapters.
     *
     * @return array{id: string, action: string|null, method: string, title: string|null, description: string|null, fields: list<array<string, mixed>>, values: array<string, mixed>}
     */
    public function toInertia(): array
    {
        $fields = [];
        $values = [];

        foreach ($this->fields() as $field) {
            if (! $field instanceof Field) {
                continue;
            }

            $fields[] = $field->toInertia();
            $values = Values::set($values, $field->name(), $this->resolvedValue($field));
        }

        $payload = [
            'id' => $this->id(),
            'action' => $this->action(),
            'method' => $this->method(),
            'title' => $this->title(),
            'description' => $this->description(),
            'fields' => $fields,
            'values' => JsonSafe::object($values),
        ];

        return JsonSafe::object($payload);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return $this->toInertia();
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toInertia();
    }

    protected function resolvedValue(Field $field): mixed
    {
        $name = $field->name();

        if (Values::has($this->explicitValues, $name)) {
            return $this->normalizeValue($field, Values::get($this->explicitValues, $name));
        }

        if ($this->source !== null && $field->shouldFillFromSource()) {
            $sentinel = new \stdClass;
            $fromSource = $this->valueFromSource($name, $sentinel);

            if ($fromSource !== $sentinel) {
                return $this->normalizeValue($field, $fromSource);
            }
        }

        $initial = $this->initialValues();

        if (Values::has($initial, $name)) {
            return $this->normalizeValue($field, Values::get($initial, $name));
        }

        if ($field->hasDefault()) {
            return $this->normalizeValue($field, $field->defaultValue());
        }

        return $this->typeDefault($field);
    }

    protected function valueFromSource(string $name, object $sentinel): mixed
    {
        if ($this->source === null) {
            return $sentinel;
        }

        return data_get($this->source, $name, $sentinel);
    }

    protected function normalizeValue(Field $field, mixed $value): mixed
    {
        if ($field->type() === 'file' || $value instanceof UploadedFile || $value instanceof \SplFileInfo) {
            return null;
        }

        if ($value instanceof Model) {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return match ($field->type()) {
                'date' => $value->format('Y-m-d'),
                'time' => $value->format('H:i'),
                default => $value->format('Y-m-d\TH:i'),
            };
        }

        if ($value instanceof BackedEnum) {
            return $value->value;
        }

        if (is_object($value)) {
            return $value instanceof Stringable ? (string) $value : null;
        }

        $safe = JsonSafe::value($value);

        return $safe === JsonSafe::drop() ? null : $safe;
    }

    protected function typeDefault(Field $field): mixed
    {
        return match ($field->type()) {
            'checkbox', 'toggle' => false,
            'file', 'number', 'date', 'time', 'slider' => null,
            'select' => $field->isMultiple() ? [] : '',
            'checkbox-group', 'repeater', 'blocks', 'key-value' => [],
            'color' => '#000000',
            'display', 'submit' => null,
            default => '',
        };
    }
}
