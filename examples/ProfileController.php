<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Forms\ProfileForm;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $form = ProfileForm::make($user)->withAction(route('profile.update'), 'PUT');

        return Inertia::render('Profile/Edit', [
            'form' => $form->toInertia(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $form = ProfileForm::make();
        $data = $form->validate($request);

        /** @var User $user */
        $user = $request->user();
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        if (isset($data['avatar'])) {
            $user->avatar_path = $data['avatar']->store('avatars');
        }

        $user->save();

        return back();
    }
}
