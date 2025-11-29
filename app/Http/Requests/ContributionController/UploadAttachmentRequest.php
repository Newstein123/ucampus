<?php

namespace App\Http\Requests\ContributionController;

use Illuminate\Foundation\Http\FormRequest;

class UploadAttachmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:png,jpg,jpeg,webp,pdf,xls,xlsx,doc,docx,txt,zip,rar|max:10240',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Please provide a file to upload.',
            'file.file' => 'The uploaded item must be a valid file.',
            'file.mimes' => 'File type not supported. Allowed types: png, jpg, jpeg, webp, pdf, xls, xlsx, doc, docx, txt, zip, rar.',
            'file.max' => 'File size must not exceed 10MB.',
        ];
    }
}
