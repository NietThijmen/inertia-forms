<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Support;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Stringable;

/**
 * Converts values into JSON-safe scalars/arrays and drops anything that cannot be serialized safely.
 */
final class JsonSafe
{
    private static object $drop;

    /**
     * @param  array<array-key, mixed>  $value
     * @return array<string, mixed>
     */
    public static function object(array $value): array
    {
        $out = [];

        foreach ($value as $key => $item) {
            $converted = self::value($item);

            if ($converted === self::drop()) {
                continue;
            }

            $out[(string) $key] = $converted;
        }

        return $out;
    }

    /**
     * @param  array<array-key, mixed>  $value
     * @return array<int|string, mixed>
     */
    public static function array(array $value): array
    {
        $isList = array_is_list($value);
        $out = [];

        foreach ($value as $key => $item) {
            $converted = self::value($item);

            if ($converted === self::drop()) {
                continue;
            }

            if ($isList) {
                $out[] = $converted;
            } else {
                $out[(string) $key] = $converted;
            }
        }

        return $out;
    }

    public static function value(mixed $value, int $depth = 0): mixed
    {
        if ($depth > 10) {
            return null;
        }

        if ($value === null || is_bool($value) || is_int($value) || is_string($value)) {
            return $value;
        }

        if (is_float($value)) {
            return is_finite($value) ? $value : null;
        }

        if ($value instanceof \BackedEnum) {
            return self::value($value->value, $depth + 1);
        }

        if ($value instanceof DateTimeInterface) {
            return $value->format(DateTimeInterface::ATOM);
        }

        if ($value instanceof Model) {
            return self::drop();
        }

        if ($value instanceof Stringable) {
            return (string) $value;
        }

        if (is_array($value)) {
            return self::array($value);
        }

        return self::drop();
    }

    /**
     * Keep only scalar HTML attributes. Event handlers and javascript: URLs are dropped.
     *
     * @param  array<array-key, mixed>  $attributes
     * @return array<string, bool|float|int|string|null>
     */
    public static function attributes(array $attributes): array
    {
        $out = [];

        foreach ($attributes as $name => $value) {
            $name = strtolower((string) $name);

            if ($name === '' || str_starts_with($name, 'on') || in_array($name, ['formaction', 'form', 'srcdoc'], true)) {
                continue;
            }

            if (is_string($value) && preg_match('/^\s*javascript:/i', $value) === 1) {
                continue;
            }

            $converted = self::value($value);

            if ($converted === self::drop() || (! is_scalar($converted) && $converted !== null)) {
                continue;
            }

            /** @var bool|float|int|string|null $converted */
            $out[$name] = $converted;
        }

        return $out;
    }

    public static function drop(): object
    {
        return self::$drop ??= new \stdClass;
    }
}
