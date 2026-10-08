<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Tests\Unit;

use NietThijmen\InertiaForms\Tests\Fixtures\ProfileForm;
use NietThijmen\InertiaForms\Tests\Fixtures\UserModel;
use NietThijmen\InertiaForms\Tests\TestCase;

final class FormSerializationTest extends TestCase
{
    public function test_it_serializes_fields_and_initial_values(): void
    {
        $payload = ProfileForm::make()
            ->withAction('/profile', 'PUT')
            ->toInertia();

        $this->assertSame('profile-form', $payload['id']);
        $this->assertSame('/profile', $payload['action']);
        $this->assertSame('PUT', $payload['method']);
        $this->assertSame('Profile', $payload['title']);
        $this->assertSame('Update your profile', $payload['description']);

        $names = array_column($payload['fields'], 'name');
        $this->assertSame([
            'name',
            'email',
            'password',
            'age',
            'birthday',
            'bio',
            'subscribe',
            'role',
            'color',
            'avatar',
            'address.city',
            'address.country',
        ], $names);

        $this->assertSame('', $payload['values']['name']);
        $this->assertSame('jane@example.com', $payload['values']['email']);
        $this->assertSame('', $payload['values']['password']);
        $this->assertNull($payload['values']['age']);
        $this->assertNull($payload['values']['birthday']);
        $this->assertSame('', $payload['values']['bio']);
        $this->assertTrue($payload['values']['subscribe']);
        $this->assertSame('', $payload['values']['role']);
        $this->assertSame('', $payload['values']['color']);
        $this->assertNull($payload['values']['avatar']);
        $this->assertSame('Amsterdam', $payload['values']['address']['city']);
        $this->assertSame('NL', $payload['values']['address']['country']);
    }

    public function test_it_uses_html_names_for_nested_fields(): void
    {
        $city = $this->field(ProfileForm::make()->toInertia(), 'address.city');

        $this->assertSame('address.city', $city['name']);
        $this->assertSame('address[city]', $city['htmlName']);
        $this->assertSame('City', $city['label']);
    }

    public function test_null_empty_and_missing_values_follow_documented_priority(): void
    {
        $form = ProfileForm::make()
            ->fill([
                'name' => null,
                'email' => '',
            ])
            ->withValues([
                'role' => 'admin',
            ]);

        $values = $form->toInertia()['values'];

        $this->assertNull($values['name']);
        $this->assertSame('', $values['email']);
        $this->assertSame('admin', $values['role']);
        $this->assertSame('Amsterdam', $values['address']['city']);
        $this->assertSame('NL', $values['address']['country']);
        $this->assertNull($values['age']);
    }

    public function test_it_fills_from_a_model_without_serializing_the_model(): void
    {
        $user = new UserModel([
            'name' => 'Ada',
            'email' => 'ada@example.com',
            'password' => 'hashed-password',
            'api_token' => 'tok_123',
            'secret' => 'should-never-leak',
            'address' => [
                'city' => 'London',
                'country' => 'GB',
            ],
        ]);

        $payload = ProfileForm::make($user)->toInertia();
        $encoded = json_encode($payload, JSON_THROW_ON_ERROR);

        $this->assertSame('Ada', $payload['values']['name']);
        $this->assertSame('ada@example.com', $payload['values']['email']);
        $this->assertSame('London', $payload['values']['address']['city']);
        $this->assertSame('', $payload['values']['password']);
        $this->assertStringNotContainsString('hashed-password', $encoded);
        $this->assertStringNotContainsString('tok_123', $encoded);
        $this->assertStringNotContainsString('should-never-leak', $encoded);
        $this->assertStringNotContainsString('api_token', $encoded);
        $this->assertArrayNotHasKey('secret', $payload['values']);
        $this->assertArrayNotHasKey('password', $payload);
    }

    public function test_serialized_payload_matches_shared_fixture(): void
    {
        $payload = ProfileForm::make()
            ->withAction('/profile', 'PUT')
            ->toInertia();

        $fixturePath = dirname(__DIR__).'/Fixtures/form-payload.json';

        if (! is_file($fixturePath)) {
            file_put_contents(
                $fixturePath,
                json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n",
            );
        }

        $fixture = json_decode((string) file_get_contents($fixturePath), true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame($fixture, $payload);
    }

    public function test_payload_is_json_safe(): void
    {
        $payload = ProfileForm::make()->toInertia();
        $json = json_encode($payload, JSON_THROW_ON_ERROR);
        $decoded = json_decode($json, true, 512, JSON_THROW_ON_ERROR);

        $this->assertSame($payload, $decoded);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function field(array $payload, string $name): array
    {
        foreach ($payload['fields'] as $field) {
            if ($field['name'] === $name) {
                return $field;
            }
        }

        $this->fail("Missing field [{$name}]");
    }
}
