<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Tests\Unit;

use DateTimeImmutable;
use NietThijmen\InertiaForms\Fields\BlocksField;
use NietThijmen\InertiaForms\Fields\CheckboxGroupField;
use NietThijmen\InertiaForms\Fields\ColorField;
use NietThijmen\InertiaForms\Fields\ComboboxField;
use NietThijmen\InertiaForms\Fields\ComposerField;
use NietThijmen\InertiaForms\Fields\DisplayField;
use NietThijmen\InertiaForms\Fields\HiddenField;
use NietThijmen\InertiaForms\Fields\KeyValueField;
use NietThijmen\InertiaForms\Fields\LinkField;
use NietThijmen\InertiaForms\Fields\OtpField;
use NietThijmen\InertiaForms\Fields\RepeaterField;
use NietThijmen\InertiaForms\Fields\RichTextField;
use NietThijmen\InertiaForms\Fields\SliderField;
use NietThijmen\InertiaForms\Fields\SlugField;
use NietThijmen\InertiaForms\Fields\SubmitField;
use NietThijmen\InertiaForms\Fields\TextField;
use NietThijmen\InertiaForms\Fields\TimeField;
use NietThijmen\InertiaForms\Fields\ToggleField;
use NietThijmen\InertiaForms\Form;
use NietThijmen\InertiaForms\Tests\TestCase;

final class KitchenSinkForm extends Form
{
    public function fields(): array
    {
        return [
            SlugField::make('slug')->from('title'),
            LinkField::make('website'),
            HiddenField::make('token')->default('abc'),
            OtpField::make('code')->length(4),
            ComboboxField::make('country')->options(['nl' => 'Netherlands']),
            CheckboxGroupField::make('tags')->options(['a' => 'A', 'b' => 'B']),
            ToggleField::make('enabled'),
            TimeField::make('starts')->default(new DateTimeImmutable('2020-01-02 15:04:00')),
            ColorField::make('accent'),
            SliderField::make('volume')->min(0)->max(10)->step(1),
            ComposerField::make('note')->rows(3),
            RichTextField::make('body'),
            RepeaterField::make('items')->fields([
                TextField::make('title')->rules([fn () => false, 'unique-rule-token']),
            ]),
            BlocksField::make('sections')->blocks([
                'hero' => [
                    'label' => 'Hero',
                    'fields' => [
                        TextField::make('headline')->rules(['unique-block-rule']),
                    ],
                ],
            ]),
            KeyValueField::make('meta'),
            DisplayField::make('intro')->label('Hello')->description('World')->variant('heading'),
            SubmitField::make('save'),
        ];
    }
}

final class FieldTypesTest extends TestCase
{
    public function test_new_fields_serialize_type_and_extra_keys_without_rules(): void
    {
        $payload = KitchenSinkForm::make()->toInertia();
        $json = json_encode($payload, JSON_THROW_ON_ERROR);
        $fields = [];

        foreach ($payload['fields'] as $field) {
            $fields[$field['name']] = $field;
        }

        $this->assertSame('slug', $fields['slug']['type']);
        $this->assertSame('title', $fields['slug']['from']);
        $this->assertSame('link', $fields['website']['type']);
        $this->assertSame('hidden', $fields['token']['type']);
        $this->assertSame('otp', $fields['code']['type']);
        $this->assertSame(4, $fields['code']['length']);
        $this->assertSame('combobox', $fields['country']['type']);
        $this->assertSame('Netherlands', $fields['country']['options'][0]['label']);
        $this->assertSame('checkbox-group', $fields['tags']['type']);
        $this->assertSame('tags[]', $fields['tags']['htmlName']);
        $this->assertSame('toggle', $fields['enabled']['type']);
        $this->assertSame('time', $fields['starts']['type']);
        $this->assertSame('color', $fields['accent']['type']);
        $this->assertSame('slider', $fields['volume']['type']);
        $this->assertSame(0, $fields['volume']['attributes']['min']);
        $this->assertSame(10, $fields['volume']['attributes']['max']);
        $this->assertSame(1, $fields['volume']['attributes']['step']);
        $this->assertSame('composer', $fields['note']['type']);
        $this->assertSame(3, $fields['note']['attributes']['rows']);
        $this->assertSame('rich-text', $fields['body']['type']);
        $this->assertSame('repeater', $fields['items']['type']);
        $this->assertSame('text', $fields['items']['fields'][0]['type']);
        $this->assertSame('title', $fields['items']['fields'][0]['name']);
        $this->assertArrayNotHasKey('rules', $fields['items']['fields'][0]);
        $this->assertSame('blocks', $fields['sections']['type']);
        $this->assertSame('hero', $fields['sections']['blocks'][0]['type']);
        $this->assertSame('Hero', $fields['sections']['blocks'][0]['label']);
        $this->assertSame('headline', $fields['sections']['blocks'][0]['fields'][0]['name']);
        $this->assertArrayNotHasKey('rules', $fields['sections']['blocks'][0]['fields'][0]);
        $this->assertSame('key-value', $fields['meta']['type']);
        $this->assertSame('display', $fields['intro']['type']);
        $this->assertSame('heading', $fields['intro']['variant']);
        $this->assertSame('submit', $fields['save']['type']);
        $this->assertSame('Submit', $fields['save']['label']);

        $this->assertSame('', $payload['values']['slug']);
        $this->assertSame('abc', $payload['values']['token']);
        $this->assertSame([], $payload['values']['tags']);
        $this->assertFalse($payload['values']['enabled']);
        $this->assertSame('15:04', $payload['values']['starts']);
        $this->assertSame('#000000', $payload['values']['accent']);
        $this->assertNull($payload['values']['volume']);
        $this->assertSame([], $payload['values']['items']);
        $this->assertSame([], $payload['values']['sections']);
        $this->assertSame([], $payload['values']['meta']);
        $this->assertNull($payload['values']['intro']);
        $this->assertNull($payload['values']['save']);

        $this->assertStringNotContainsString('unique-rule-token', $json);
        $this->assertStringNotContainsString('unique-block-rule', $json);
        $this->assertStringNotContainsString('Closure', $json);
        $this->assertSame($payload, json_decode($json, true, 512, JSON_THROW_ON_ERROR));
    }

    public function test_slug_omits_a_source_until_from_is_set(): void
    {
        $field = SlugField::make('slug')->toInertia();

        $this->assertSame('slug', $field['type']);
        $this->assertNull($field['from']);
    }

    public function test_otp_length_defaults_to_six(): void
    {
        $this->assertSame(6, OtpField::make('code')->toInertia()['length']);
    }

    public function test_display_variant_defaults_to_paragraph(): void
    {
        $field = DisplayField::make('note')->variant('nope')->toInertia();

        $this->assertSame('paragraph', $field['variant']);
    }

    public function test_nested_checkbox_group_uses_its_array_name(): void
    {
        $field = CheckboxGroupField::make('address.tags')->toInertia();

        $this->assertSame('address[tags][]', $field['htmlName']);
    }
}
