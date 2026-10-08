<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class SlugField extends Field
{
    protected ?string $from = null;

    public function type(): string
    {
        return 'slug';
    }

    /**
     * Mirror this sibling field until the user edits the slug.
     */
    public function from(string $field): static
    {
        $this->from = $field;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializedExtras(): array
    {
        return [
            'from' => $this->from,
        ];
    }
}
