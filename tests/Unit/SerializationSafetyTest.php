<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Tests\Unit;

use NietThijmen\InertiaForms\Tests\Fixtures\LeakingForm;
use NietThijmen\InertiaForms\Tests\Fixtures\UserModel;
use NietThijmen\InertiaForms\Tests\TestCase;

final class SerializationSafetyTest extends TestCase
{
    public function test_server_only_data_never_appears_in_the_payload(): void
    {
        $payload = LeakingForm::make(new UserModel([
            'name' => 'Visible',
            'secret' => 'model-secret',
            'api_token' => 'tok_123',
            'password' => 'hashed-password',
        ]))->toInertia();

        $json = json_encode($payload, JSON_THROW_ON_ERROR);

        $this->assertArrayNotHasKey('rules', $payload);
        $this->assertArrayNotHasKey('messages', $payload);
        $this->assertArrayNotHasKey('authorize', $payload);
        $this->assertArrayNotHasKey('source', $payload);

        $name = $payload['fields'][0];
        $this->assertArrayNotHasKey('rules', $name);
        $this->assertArrayNotHasKey('serverRules', $name);
        $this->assertSame('ok', $name['attributes']['data-safe']);
        $this->assertArrayNotHasKey('onclick', $name['attributes']);
        $this->assertArrayNotHasKey('formaction', $name['attributes']);
        $this->assertArrayNotHasKey('href', $name['attributes']);
        $this->assertArrayNotHasKey('secret_callback', $name['meta']);
        $this->assertSame(['ok' => true], $name['meta']['nested']);

        $this->assertStringNotContainsString('max:120', $json);
        $this->assertStringNotContainsString('prohibited', $json);
        $this->assertStringNotContainsString('super-secret-token', $json);
        $this->assertStringNotContainsString('X-Admin-Token', $json);
        $this->assertStringNotContainsString('model-secret', $json);
        $this->assertStringNotContainsString('tok_123', $json);
        $this->assertStringNotContainsString('hashed-password', $json);
        $this->assertStringNotContainsString('Closure', $json);
        $this->assertStringNotContainsString('secret_callback', $json);
        $this->assertStringNotContainsString('onclick', $json);
        $this->assertStringNotContainsString('javascript:', $json);
    }

    public function test_form_objects_json_encode_through_the_whitelist(): void
    {
        $form = LeakingForm::make();
        $encoded = json_encode($form, JSON_THROW_ON_ERROR);

        $this->assertStringNotContainsString('rules', $encoded);
        $this->assertStringContainsString('"id":"leaking-form"', $encoded);
    }
}
