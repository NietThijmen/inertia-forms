<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Support;

use Illuminate\Support\Arr;

final class Values
{
    /**
     * @param  array<array-key, mixed>  $data
     */
    public static function has(array $data, string $dotted): bool
    {
        if (array_key_exists($dotted, $data)) {
            return true;
        }

        return Arr::has($data, $dotted);
    }

    /**
     * @param  array<array-key, mixed>  $data
     */
    public static function get(array $data, string $dotted): mixed
    {
        if (array_key_exists($dotted, $data)) {
            return $data[$dotted];
        }

        return data_get($data, $dotted);
    }

    /**
     * @param  array<array-key, mixed>  $data
     * @return array<array-key, mixed>
     */
    public static function set(array $data, string $dotted, mixed $value): array
    {
        data_set($data, $dotted, $value);

        return $data;
    }
}
