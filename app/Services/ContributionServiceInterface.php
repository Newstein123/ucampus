<?php

namespace App\Services;

interface ContributionServiceInterface
{
    public function list(array $data = []);
    public function create(array $data = []);
}
