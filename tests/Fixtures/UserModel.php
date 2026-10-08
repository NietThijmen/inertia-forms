<?php

declare(strict_types=1);

namespace NietThijmen\InertiaForms\Tests\Fixtures;

use Illuminate\Database\Eloquent\Model;

final class UserModel extends Model
{
    protected $guarded = [];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'api_token',
        'secret',
    ];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'name' => 'Ada',
        'email' => 'ada@example.com',
        'password' => 'hashed-password',
        'api_token' => 'tok_123',
        'secret' => 'should-never-leak',
        'address' => null,
    ];
}
