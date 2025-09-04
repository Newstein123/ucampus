<?php

namespace App\Repositories;

interface DiscussionRepositoryInterface
{
    public function findById(int $id);
    public function create(array $data = []);
    public function findByContributionId(int $id, array $data = []);
    public function update(int $id, array $data = []);
    public function delete(int $id);
    public function updateInterest(int $id);
}
