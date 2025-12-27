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
            'file' => [
                'required',
                'file',
                // Check by extension (mimes) OR by MIME type (mimetypes) - either one can pass
                function ($attribute, $value, $fail) {
                    if (!$value) {
                        return;
                    }

                    $allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'xls', 'xlsx', 'doc', 'docx', 'txt', 'zip', 'rar'];
                    $allowedMimeTypes = [
                        'image/png',
                        'image/jpeg',
                        'image/jpg',
                        'image/webp',
                        'application/pdf',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain',
                        'text/html',
                        'text/css',
                        'text/javascript',
                        'application/zip',
                        'application/x-rar-compressed',
                        'application/x-zip-compressed',
                        'application/octet-stream',
                    ];

                    $extension = strtolower($value->getClientOriginalExtension());
                    $mimeType = $value->getMimeType();

                    // Allow if extension OR mime type is in allowed list
                    $extensionAllowed = in_array($extension, $allowedExtensions);
                    $mimeTypeAllowed = in_array($mimeType, $allowedMimeTypes);

                    if (!$extensionAllowed && !$mimeTypeAllowed) {
                        $fail('File type not supported. Allowed types: ' . implode(', ', $allowedExtensions));
                    }
                },
                'max:10240',
            ],
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
