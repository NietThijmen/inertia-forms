<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class LinkField extends Field
{
    public function type(): string
    {
        return 'link';
    }
}
