<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class DisplayField extends Field
{
    protected string $variant = 'paragraph';

    public function type(): string
    {
        return 'display';
    }

    /**
     * One of `heading`, `paragraph`, or `divider`.
     */
    public function variant(string $variant): static
    {
        $this->variant = $variant;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializedExtras(): array
    {
        return [
            'variant' => in_array($this->variant, ['heading', 'paragraph', 'divider'], true)
                ? $this->variant
                : 'paragraph',
        ];
    }
}
