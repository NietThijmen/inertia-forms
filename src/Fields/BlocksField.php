<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class BlocksField extends Field
{
    /**
     * @var array<int|string, mixed>
     */
    protected array $definitions = [];

    public function type(): string
    {
        return 'blocks';
    }

    /**
     * Each definition has a label and child fields. A string key, or `type`, identifies the block.
     *
     * @param  array<int|string, array{type?: string, label?: string, fields?: array<int, mixed>}>  $definitions
     */
    public function blocks(array $definitions): static
    {
        $this->definitions = $definitions;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializedExtras(): array
    {
        $blocks = [];

        foreach ($this->definitions as $key => $definition) {
            if (! is_array($definition)) {
                continue;
            }

            $type = '';

            if (isset($definition['type']) && is_string($definition['type']) && $definition['type'] !== '') {
                $type = $definition['type'];
            } elseif (is_string($key)) {
                $type = $key;
            }

            if ($type === '') {
                continue;
            }

            $fields = [];

            foreach ($definition['fields'] ?? [] as $field) {
                if ($field instanceof Field) {
                    $fields[] = $field->toInertia();
                }
            }

            $label = $definition['label'] ?? $type;

            $blocks[] = [
                'type' => $type,
                'label' => is_scalar($label) ? (string) $label : $type,
                'fields' => $fields,
            ];
        }

        return [
            'blocks' => $blocks,
        ];
    }
}
