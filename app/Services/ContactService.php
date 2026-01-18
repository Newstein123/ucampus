<?php

namespace App\Services;

use App\Repositories\ContactRepositoryInterface;

class ContactService implements ContactServiceInterface
{
    public function __construct(
        protected ContactRepositoryInterface $contactRepository
    ) {}

    public function create(array $data): array
    {
        try {
            $contact = $this->contactRepository->create([
                'fullname' => $data['fullname'],
                'email' => $data['email'],
                'message' => $data['message'],
            ]);

            return [
                'success' => true,
                'message' => 'Contact message submitted successfully',
                'data' => $contact,
            ];
        } catch (\Exception $e) {
            throw new \Exception('Failed to submit contact message: ' . $e->getMessage());
        }
    }
}

