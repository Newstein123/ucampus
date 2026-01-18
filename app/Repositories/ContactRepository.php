<?php

namespace App\Repositories;

use App\Models\Contact;

class ContactRepository implements ContactRepositoryInterface
{
    public function create(array $data): Contact
    {
        return Contact::create($data);
    }
}

