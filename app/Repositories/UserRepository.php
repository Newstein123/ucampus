<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function create(array $data): User
    {
        return User::create($data);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    public function findByPhone(string $phone): ?User
    {
        return User::where('phone', $phone)->first();
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function update($user, array $data)
    {
        $user->fill($data);
        $user->save();
        return $user;
    }

    public function findByProviderId(string $provider, string $providerUserId)
    {
        $account = \App\Models\SocialAccount::where('provider', $provider)
            ->where('provider_user_id', $providerUserId)
            ->first();
        return $account ? $account->user : null;
    }
}
