<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

use Illuminate\Support\Str;
use NietThijmen\InertiaForms\Support\HtmlName;
use NietThijmen\InertiaForms\Support\JsonSafe;

/**
 * @phpstan-consistent-constructor
 */
abstract class Field
{
    protected string $name;

    protected ?string $label = null;

    protected ?string $description = null;

    protected ?string $placeholder = null;

    protected mixed $default = null;

    protected bool $hasDefault = false;

    protected bool $required = false;

    protected bool $disabled = false;

    protected bool $readonly = false;

    protected bool $fillFromSource = true;

    /**
     * @var array<string, mixed>
     */
    protected array $attributes = [];

    /**
     * @var array<string, mixed>
     */
    protected array $meta = [];

    /**
     * Server-side Laravel validation rules. Never serialized to the frontend.
     *
     * @var array<int, mixed>
     */
    protected array $serverRules = [];

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    public static function make(string $name): static
    {
        return new static($name);
    }

    abstract public function type(): string;

    public function label(?string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function description(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function placeholder(?string $placeholder): static
    {
        $this->placeholder = $placeholder;

        return $this;
    }

    public function default(mixed $value): static
    {
        $this->default = $value;
        $this->hasDefault = true;

        return $this;
    }

    /**
     * Presentation hint only. Does not add a Laravel validation rule.
     */
    public function required(bool $required = true): static
    {
        $this->required = $required;

        return $this;
    }

    public function disabled(bool $disabled = true): static
    {
        $this->disabled = $disabled;

        return $this;
    }

    public function readonly(bool $readonly = true): static
    {
        $this->readonly = $readonly;

        return $this;
    }

    /**
     * When false, model/source values are ignored for this field (default for password and file).
     */
    public function fillFromSource(bool $fill = true): static
    {
        $this->fillFromSource = $fill;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function attributes(array $attributes): static
    {
        $this->attributes = array_merge($this->attributes, $attributes);

        return $this;
    }

    public function attribute(string $name, mixed $value): static
    {
        $this->attributes[$name] = $value;

        return $this;
    }

    /**
     * Extra presentation metadata. Must be JSON-safe or it will be dropped during serialization.
     */
    public function meta(string $key, mixed $value): static
    {
        $this->meta[$key] = $value;

        return $this;
    }

    /**
     * Server-only Laravel validation rules. These are never included in `toInertia()`.
     *
     * @param  array<int, mixed>|string  $rules
     */
    public function rules(array|string $rules): static
    {
        $this->serverRules = is_string($rules) ? explode('|', $rules) : array_values($rules);

        return $this;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function htmlName(): string
    {
        return HtmlName::fromDotted($this->name);
    }

    public function defaultValue(): mixed
    {
        return $this->default;
    }

    public function hasDefault(): bool
    {
        return $this->hasDefault;
    }

    public function shouldFillFromSource(): bool
    {
        return $this->fillFromSource;
    }

    /**
     * @return array<int, mixed>
     */
    public function serverRules(): array
    {
        return $this->serverRules;
    }

    public function isMultiple(): bool
    {
        return false;
    }

    /**
     * @return array<string, mixed>
     */
    public function toInertia(): array
    {
        $payload = [
            'name' => $this->name,
            'htmlName' => $this->htmlName(),
            'type' => $this->type(),
            'label' => $this->label ?? Str::headline(str_replace('.', ' ', Str::afterLast($this->name, '.'))),
            'description' => $this->description,
            'placeholder' => $this->placeholder,
            'required' => $this->required,
            'disabled' => $this->disabled,
            'readonly' => $this->readonly,
            'attributes' => JsonSafe::attributes($this->attributes),
            'meta' => JsonSafe::object($this->meta),
        ];

        foreach ($this->serializedExtras() as $key => $value) {
            if ($value === JsonSafe::drop()) {
                continue;
            }

            $payload[$key] = $value;
        }

        return JsonSafe::object($payload);
    }

    /**
     * Extra JSON-safe keys for specific field types. Never include rules, closures, or objects.
     *
     * @return array<string, mixed>
     */
    protected function serializedExtras(): array
    {
        return [];
    }
}
