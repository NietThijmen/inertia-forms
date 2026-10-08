<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Tests\Feature;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use NietThijmen\InertiaForms\Tests\Fixtures\ProfileForm;
use NietThijmen\InertiaForms\Tests\TestCase;

final class FormValidationTest extends TestCase
{
    public function test_valid_submissions_return_validated_data(): void
    {
        $request = $this->formRequest([
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'role' => 'admin',
            'address' => [
                'city' => 'London',
                'country' => 'GB',
            ],
            'subscribe' => '1',
        ]);

        $data = ProfileForm::make()->validate($request);

        $this->assertSame('Ada Lovelace', $data['name']);
        $this->assertSame('ada@example.com', $data['email']);
        $this->assertSame('admin', $data['role']);
        $this->assertSame('London', $data['address']['city']);
        $this->assertArrayHasKey('subscribe', $data);
        $this->assertArrayNotHasKey('secret', $data);
    }

    public function test_invalid_submissions_throw_laravels_validation_exception(): void
    {
        $request = $this->formRequest([
            'name' => '',
            'email' => 'not-an-email',
            'role' => 'nope',
            'address' => [
                'city' => '',
                'country' => 'GBR',
            ],
        ]);

        try {
            ProfileForm::make()->validate($request);
            $this->fail('Expected ValidationException');
        } catch (ValidationException $exception) {
            $this->assertSame('default', $exception->errorBag);
            $this->assertArrayHasKey('name', $exception->errors());
            $this->assertArrayHasKey('email', $exception->errors());
            $this->assertArrayHasKey('role', $exception->errors());
            $this->assertArrayHasKey('address.city', $exception->errors());
            $this->assertArrayHasKey('address.country', $exception->errors());
        }
    }

    public function test_browser_supplied_rules_are_ignored(): void
    {
        $request = $this->formRequest([
            'name' => 'Ada',
            'email' => 'ada@example.com',
            'role' => 'admin',
            'address' => [
                'city' => 'London',
                'country' => 'GB',
            ],
            'rules' => ['email' => []],
            '_fields' => [
                ['name' => 'email', 'required' => false],
            ],
        ]);

        $data = ProfileForm::make()->validate($request);

        $this->assertSame('ada@example.com', $data['email']);
        $this->assertArrayNotHasKey('rules', $data);
        $this->assertArrayNotHasKey('_fields', $data);
    }

    public function test_unauthorized_requests_throw_laravels_authorization_exception(): void
    {
        $request = Request::create('/profile', 'POST', [
            'name' => 'Ada',
            'email' => 'ada@example.com',
            'role' => 'admin',
            'address' => [
                'city' => 'London',
                'country' => 'GB',
            ],
        ]);

        $this->expectException(AuthorizationException::class);

        ProfileForm::make()->validate($request);
    }

    public function test_file_fields_are_validated_with_laravel(): void
    {
        $request = $this->formRequest([
            'name' => 'Ada',
            'email' => 'ada@example.com',
            'role' => 'user',
            'address' => [
                'city' => 'London',
                'country' => 'GB',
            ],
        ], [
            'avatar' => UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg'),
        ]);

        $data = ProfileForm::make()->validate($request);

        $this->assertInstanceOf(UploadedFile::class, $data['avatar']);
        $this->assertSame('photo.jpg', $data['avatar']->getClientOriginalName());
    }

    public function test_oversized_files_fail_validation(): void
    {
        $request = $this->formRequest([
            'name' => 'Ada',
            'email' => 'ada@example.com',
            'role' => 'user',
            'address' => [
                'city' => 'London',
                'country' => 'GB',
            ],
        ], [
            'avatar' => UploadedFile::fake()->create('huge.jpg', 2048, 'image/jpeg'),
        ]);

        $this->expectException(ValidationException::class);

        ProfileForm::make()->validate($request);
    }

    /**
     * @param  array<string, mixed>  $input
     * @param  array<string, UploadedFile>  $files
     */
    private function formRequest(array $input, array $files = []): Request
    {
        $request = Request::create('/profile', 'POST', $input, [], $files);
        $request->setUserResolver(fn () => (object) ['id' => 1]);

        return $request;
    }
}
