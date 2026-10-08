<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SignInTest extends TestCase
{
    public function test_sign_in_page_includes_the_form_payload(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('SignIn')
                ->where('form.id', 'sign-in-form')
                ->where('form.action', route('sign-in.store'))
                ->where('form.method', 'POST')
                ->where('form.title', 'Sign in')
                ->has('form.fields', 2)
                ->where('form.fields.0.name', 'email')
                ->where('form.fields.0.label', 'Email')
                ->where('form.fields.1.name', 'password')
                ->where('form.fields.1.label', 'Password')
                ->where('form.fields.1.type', 'password')
                ->where('flash.success', null));
    }

    public function test_missing_fields_fail_server_validation(): void
    {
        $this->from(route('sign-in'))
            ->post(route('sign-in.store'), [
                'email' => '',
                'password' => '',
            ])
            ->assertRedirect(route('sign-in'))
            ->assertSessionHasErrors(['email', 'password']);
    }

    public function test_unknown_credentials_are_rejected(): void
    {
        $this->from(route('sign-in'))
            ->post(route('sign-in.store'), [
                'email' => 'ada@example.com',
                'password' => 'wrong-password',
            ])
            ->assertRedirect(route('sign-in'))
            ->assertSessionHasErrors([
                'email' => 'These credentials do not match our records.',
            ]);
    }

    public function test_demo_credentials_redirect_back_with_a_success_flash(): void
    {
        $this->from(route('sign-in'))
            ->post(route('sign-in.store'), [
                'email' => 'ada@example.com',
                'password' => 'password',
            ])
            ->assertRedirect(route('sign-in'))
            ->assertSessionHas('success', 'Signed in.');

        $this->get(route('sign-in'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('flash.success', 'Signed in.'));
    }
}
