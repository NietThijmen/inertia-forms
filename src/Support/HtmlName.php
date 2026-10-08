<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Support;

final class HtmlName
{
    /**
     * Convert a Laravel dotted name (`address.city`) into an HTML field name (`address[city]`).
     */
    public static function fromDotted(string $name): string
    {
        $parts = explode('.', $name);
        $html = array_shift($parts) ?? $name;

        foreach ($parts as $part) {
            $html .= '['.$part.']';
        }

        return $html;
    }
}
