<?php

namespace App\Repositories;

use App\Models\Contact;

interface ContactRepositoryInterface
{
    public function create(array $data): Contact;
}

