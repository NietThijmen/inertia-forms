<?php

declare(strict_types=1);

namespace App\Http\Forms;

use App\Models\User;
use Illuminate\Http\Request;
use NietThijmen\InertiaForms\Fields\EmailField;
use NietThijmen\InertiaForms\Fields\FileField;
use NietThijmen\InertiaForms\Fields\TextField;
use NietThijmen\InertiaForms\Form;

final class ProfileForm extends Form
{
    public function title(): ?string
    {
        return 'Profile';
    }

    public function fields(): array
    {
        return [
            TextField::make('name')
                ->label('Name')
                ->placeholder('Jane Doe')
                ->required(),
            EmailField::make('email')
                ->label('Email'),
            FileField::make('avatar')
                ->label('Avatar')
                ->accept('image/*')
                ->meta('current', $this->currentAvatarName()),
        ];
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
            'avatar' => ['nullable', 'file', 'image', 'max:1024'],
        ];
    }

    public function authorize(Request $request): bool
    {
        return $request->user() !== null;
    }

    private function currentAvatarName(): ?string
    {
        $source = $this->source;

        return $source instanceof User ? $source->avatar_path : null;
    }
}
