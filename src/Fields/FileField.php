<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class FileField extends Field
{
    protected bool $fillFromSource = false;

    protected bool $multiple = false;

    protected ?string $accept = null;

    public function type(): string
    {
        return 'file';
    }

    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;

        return $this;
    }

    public function accept(string $accept): static
    {
        $this->accept = $accept;

        return $this;
    }

    public function isMultiple(): bool
    {
        return $this->multiple;
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializedExtras(): array
    {
        return [
            'multiple' => $this->multiple,
            'accept' => $this->accept,
        ];
    }
}
