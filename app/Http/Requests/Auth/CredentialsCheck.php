<?php

namespace App\Http\Requests\Auth;

use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Validator;

class CredentialsCheck
{
    public function __construct(
        private string $login,
        private string $password
    ) {}

    public function __invoke(Validator $validator): void
    {
        if (
            ! Auth::attempt(['email' => $this->login, 'password' => $this->password]) &&
            ! Auth::attempt(['username' => $this->login, 'password' => $this->password])
        ) {
            $validator->errors()->add('login', __('auth.failed'));
        }
    }
}
