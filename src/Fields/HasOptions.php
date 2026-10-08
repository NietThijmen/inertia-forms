<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

use NietThijmen\InertiaForms\Support\JsonSafe;
use NietThijmen\InertiaForms\Support\Options;

trait HasOptions
{
    /**
     * @var array<array-key, mixed>
     */
    protected array $options = [];

    /**
     * @param  array<array-key, mixed>  $options
     */
    public function options(array $options): static
    {
        $this->options = $options;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializedExtras(): array
    {
        $extras = [
            'options' => Options::normalize($this->options),
        ];

        if (property_exists($this, 'multiple')) {
            $extras['multiple'] = (bool) $this->multiple;
        }

        return JsonSafe::object($extras);
    }
}
