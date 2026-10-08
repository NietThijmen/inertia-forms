<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Support;

final class Options
{
    /**
     * @param  array<array-key, mixed>  $options
     * @return list<array{value: mixed, label: string, disabled: bool}>
     */
    public static function normalize(array $options): array
    {
        $out = [];

        foreach ($options as $key => $option) {
            if (is_array($option) && array_key_exists('value', $option)) {
                $value = JsonSafe::value($option['value']);

                if ($value === JsonSafe::drop()) {
                    continue;
                }

                $out[] = [
                    'value' => $value,
                    'label' => (string) ($option['label'] ?? $value),
                    'disabled' => (bool) ($option['disabled'] ?? false),
                ];

                continue;
            }

            $value = JsonSafe::value(is_int($key) ? $option : $key);

            if ($value === JsonSafe::drop()) {
                continue;
            }

            $out[] = [
                'value' => $value,
                'label' => is_scalar($option) || $option instanceof \Stringable
                    ? (string) $option
                    : (string) $value,
                'disabled' => false,
            ];
        }

        return $out;
    }
}
