<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Tests\Fixtures;

use Illuminate\Http\Request;
use NietThijmen\InertiaForms\Fields\TextField;
use NietThijmen\InertiaForms\Form;

final class LeakingForm extends Form
{
    public function fields(): array
    {
        return [
            TextField::make('name')
                ->label('Name')
                ->rules(['required', 'string'])
                ->attribute('onclick', 'alert(1)')
                ->attribute('formaction', 'https://evil.test')
                ->attribute('href', 'javascript:alert(1)')
                ->attribute('data-safe', 'ok')
                ->meta('secret_callback', fn () => 'nope')
                ->meta('nested', ['ok' => true, 'bad' => fn () => null]),
        ];
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'secret' => ['prohibited'],
        ];
    }

    public function authorize(Request $request): bool
    {
        return $request->header('X-Admin-Token') === 'super-secret-token';
    }

    public function initialValues(): array
    {
        return [
            'name' => 'Visible',
        ];
    }
}
