<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Tests\Unit;

use NietThijmen\InertiaForms\Fields\Field;
use NietThijmen\InertiaForms\Fields\SelectField;
use NietThijmen\InertiaForms\Form;
use NietThijmen\InertiaForms\Tests\TestCase;

final class ColorField extends Field
{
    public function type(): string
    {
        return 'color';
    }
}

final class ColorForm extends Form
{
    public function fields(): array
    {
        return [
            ColorField::make('accent')
                ->label('Accent')
                ->default('#112233')
                ->meta('swatch', 'brand'),
        ];
    }
}

final class FieldTest extends TestCase
{
    public function test_select_options_are_normalized(): void
    {
        $field = SelectField::make('role')
            ->options([
                'admin' => 'Admin',
                ['value' => 'user', 'label' => 'User', 'disabled' => true],
            ])
            ->toInertia();

        $this->assertSame([
            ['value' => 'admin', 'label' => 'Admin', 'disabled' => false],
            ['value' => 'user', 'label' => 'User', 'disabled' => true],
        ], $field['options']);
    }

    public function test_custom_field_types_serialize_without_core_changes(): void
    {
        $payload = ColorForm::make()->toInertia();

        $this->assertSame('color', $payload['fields'][0]['type']);
        $this->assertSame('#112233', $payload['values']['accent']);
        $this->assertSame('brand', $payload['fields'][0]['meta']['swatch']);
    }
}
