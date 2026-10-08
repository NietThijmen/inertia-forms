<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Tests\Fixtures;

use Illuminate\Http\Request;
use NietThijmen\InertiaForms\Fields\CheckboxField;
use NietThijmen\InertiaForms\Fields\DateField;
use NietThijmen\InertiaForms\Fields\EmailField;
use NietThijmen\InertiaForms\Fields\FileField;
use NietThijmen\InertiaForms\Fields\NumberField;
use NietThijmen\InertiaForms\Fields\PasswordField;
use NietThijmen\InertiaForms\Fields\RadioField;
use NietThijmen\InertiaForms\Fields\SelectField;
use NietThijmen\InertiaForms\Fields\TextareaField;
use NietThijmen\InertiaForms\Fields\TextField;
use NietThijmen\InertiaForms\Form;

final class ProfileForm extends Form
{
    public function title(): ?string
    {
        return 'Profile';
    }

    public function description(): ?string
    {
        return 'Update your profile';
    }

    public function fields(): array
    {
        return [
            TextField::make('name')
                ->label('Name')
                ->placeholder('Jane Doe')
                ->required(),
            EmailField::make('email')
                ->label('Email')
                ->description('Work email'),
            PasswordField::make('password')
                ->label('Password'),
            NumberField::make('age')
                ->label('Age')
                ->min(0),
            DateField::make('birthday')
                ->label('Birthday'),
            TextareaField::make('bio')
                ->label('Bio')
                ->rows(4),
            CheckboxField::make('subscribe')
                ->label('Subscribe'),
            SelectField::make('role')
                ->label('Role')
                ->options([
                    'admin' => 'Admin',
                    'user' => 'User',
                ]),
            RadioField::make('color')
                ->label('Color')
                ->options([
                    'red' => 'Red',
                    'blue' => 'Blue',
                ]),
            FileField::make('avatar')
                ->label('Avatar')
                ->accept('image/*'),
            TextField::make('address.city')
                ->label('City'),
            TextField::make('address.country')
                ->label('Country')
                ->default('NL'),
        ];
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
            'password' => ['nullable', 'string', 'min:8'],
            'age' => ['nullable', 'integer', 'min:0'],
            'birthday' => ['nullable', 'date'],
            'bio' => ['nullable', 'string'],
            'subscribe' => ['sometimes', 'boolean'],
            'role' => ['required', 'in:admin,user'],
            'color' => ['nullable', 'in:red,blue'],
            'avatar' => ['nullable', 'file', 'max:1024'],
            'address.city' => ['required', 'string'],
            'address.country' => ['required', 'string', 'size:2'],
        ];
    }

    public function initialValues(): array
    {
        return [
            'name' => '',
            'email' => 'jane@example.com',
            'subscribe' => true,
            'address' => [
                'city' => 'Amsterdam',
            ],
        ];
    }

    public function authorize(Request $request): bool
    {
        return $request->user() !== null;
    }
}
