<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Forms\SignInForm;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class SignInController extends Controller
{
    public function create(): Response
    {
        $form = SignInForm::make()->withAction(route('sign-in.store'));

        return Inertia::render('SignIn', [
            'form' => $form->toInertia(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = SignInForm::make()->validate($request);

        if ($data['email'] !== 'ada@example.com' || $data['password'] !== 'password') {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        return back()->with('success', 'Signed in.');
    }
}
