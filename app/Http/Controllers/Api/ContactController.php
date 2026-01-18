<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactController\CreateContactRequest;
use App\Services\ContactServiceInterface;

class ContactController extends Controller
{
    protected $contactService;

    public function __construct(ContactServiceInterface $contactService)
    {
        $this->contactService = $contactService;
    }

    /**
     * Store a new contact message
     *
     * @param CreateContactRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CreateContactRequest $request)
    {
        $data = $request->validated();
        $result = $this->contactService->create($data);
        
        return $this->response($result['data'], $result['message']);
    }
}
