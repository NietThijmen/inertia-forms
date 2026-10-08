<?php

declare(strict_types=1);

namespace App\Http\Forms;

use NietThijmen\InertiaForms\Fields\EmailField;
use NietThijmen\InertiaForms\Fields\PasswordField;
use NietThijmen\InertiaForms\Form;

final class SignInForm extends Form
{
    public function title(): ?string
    {
        return 'Sign in';
    }

    public function description(): ?string
    {
        return 'Demo account: ada@example.com / password.';
    }

    public function fields(): array
    {
        return [
            EmailField::make('email')
                ->label('Email')
                ->placeholder('ada@example.com')
                ->attribute('autocomplete', 'username')
                ->required(),
            PasswordField::make('password')
                ->label('Password')
                ->attribute('autocomplete', 'current-password')
                ->required(),
        ];
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
