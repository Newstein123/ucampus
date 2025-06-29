<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'username' => ['sometimes', 'string', 'max:255', 'unique:users,username,' . $this->user()->id],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $this->user()->id],
            'phone' => ['sometimes', 'string', 'max:20', 'unique:users,phone,' . $this->user()->id],
            'location' => ['sometimes', 'string', 'max:255'],
            'dob' => ['sometimes', 'date'],
            'avatar' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,svg', 'max:1024'],
        ];

    }
    public function messages(): array
    {
        return [
            'avatar.image' => 'The avatar must be an image file.',
            'avatar.mimes' => 'The avatar must be a file of type: jpg, jpeg, png, webp.',
            'avatar.max' => 'The avatar must not be larger than 2MB.',
        ];
    }
}
