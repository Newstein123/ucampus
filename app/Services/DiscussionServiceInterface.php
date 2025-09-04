<?php

namespace App\Services;

interface DiscussionServiceInterface
{
    public function getAllResponses(int $id);
    public function create(array $data = []);
    public function getAllParentDiscussions(int $id, array $data = []);
    public function update(int $id, array $data = []);
    public function delete(int $id);
    public function updateInterest(int $id);
}
