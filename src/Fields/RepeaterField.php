<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class RepeaterField extends Field
{
    /**
     * @var list<Field>
     */
    protected array $childFields = [];

    public function type(): string
    {
        return 'repeater';
    }

    /**
     * @param  array<int, mixed>  $fields
     */
    public function fields(array $fields): static
    {
        $children = [];

        foreach ($fields as $field) {
            if ($field instanceof Field) {
                $children[] = $field;
            }
        }

        $this->childFields = $children;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializedExtras(): array
    {
        return [
            'fields' => array_map(
                static fn (Field $field): array => $field->toInertia(),
                $this->childFields,
            ),
        ];
    }
}
