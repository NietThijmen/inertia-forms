<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Fields;

class OtpField extends Field
{
    protected int $length = 6;

    public function type(): string
    {
        return 'otp';
    }

    public function length(int $length): static
    {
        $this->length = max(1, $length);

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializedExtras(): array
    {
        return [
            'length' => $this->length,
        ];
    }
}
