<?php

namespace App\Repositories;

interface UserRepositoryInterface
{
    public function create(array $data);
    public function findByEmail(string $email);
    public function findByUsername(string $username);
    public function findByPhone(string $phone);
    public function findById(int $id);
    public function findByProviderId(string $provider, string $providerUserId);
}
