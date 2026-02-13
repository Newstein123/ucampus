<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DeleteContributionRequest;
use App\Http\Requests\Api\UpdateContributionRequest;
use App\Http\Requests\ContributionController\CreateRequest;
use App\Http\Requests\ContributionController\InterestRequest;
use App\Http\Requests\ContributionController\ListRequest;
use App\Http\Requests\ContributionController\SearchRequest;
use App\Http\Requests\ContributionController\ShowRequest;
use App\Http\Requests\ContributionController\TrendingRequest;
use App\Http\Requests\ContributionController\UploadAttachmentRequest;
use App\Http\Requests\ContributionController\DeleteAttachmentRequest;
use App\Http\Requests\ContributionController\LeaveProjectRequest;
use App\Http\Resources\ContributionResource;
use App\Services\ContributionServiceInterface;
use Illuminate\Support\Facades\Auth;

class ContributionController extends Controller
{
    protected $contributionService;

    public function __construct(ContributionServiceInterface $contributionService)
    {
        $this->contributionService = $contributionService;
    }

    public function index(ListRequest $request)
    {
        $data = $request->validated();
        $contributions = $this->contributionService->list($data);
        $resource = ContributionResource::collection($contributions);

        return $this->response($resource, 'Contributions fetched successfully');
    }

    public function search(SearchRequest $request)
    {
        $data = $request->validated();
        $contributions = $this->contributionService->search($data);
        $resource = ContributionResource::collection($contributions);

        return $this->response($resource, 'Contributions searched successfully');
    }

    public function trending(TrendingRequest $request)
    {
        $data = $request->validated();
        $contributions = $this->contributionService->trending($data);
        $resource = ContributionResource::collection($contributions);

        return $this->response($resource, 'Trending contributions fetched successfully');
    }

    public function show(ShowRequest $request)
    {
        $data = $request->validated();
        $contribution = $this->contributionService->viewBySlugOrId($data['contribution_slug']);
        
        if (!$contribution) {
            return $this->response(null, 'Contribution not found', 404);
        }
        
        $resource = new ContributionResource($contribution);

        return $this->response($resource, 'Contribution fetched successfully');
    }

    public function store(CreateRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $contribution = $this->contributionService->create($data);
        $resource = new ContributionResource($contribution);

        return $this->response($resource, 'Contribution created successfully');
    }

    public function interest(InterestRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $result = $this->contributionService->interested($data);

        return $this->response($result, $result['message']);
    }

    public function update(UpdateContributionRequest $request, int $id)
    {
        $data = $request->validated();
        $data['id'] = $id;
        $data['user_id'] = Auth::user()->id;
        $contribution = $this->contributionService->update($data);
        $resource = new ContributionResource($contribution);

        return $this->response($resource, 'Contribution updated successfully');
    }

    public function destroy(DeleteContributionRequest $request, int $id)
    {
        $this->contributionService->delete($id);

        return $this->response(null, 'Contribution deleted successfully');
    }

    /**
     * Upload a single attachment file
     * 
     * @param UploadAttachmentRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadAttachment(UploadAttachmentRequest $request)
    {
        $file = $request->file('file');
        $contributionId = $request->input('contribution_id'); // Optional, for updates
        $tempKey = $request->input('temp_key'); // Optional, for linking before contribution creation
        $result = $this->contributionService->uploadAttachment(
            $file, 
            $contributionId ? (int)$contributionId : null,
            $tempKey
        );
        return $this->response($result, 'Attachment uploaded successfully');
    }

    /**
     * Delete an attachment
     * 
     * @param DeleteAttachmentRequest $request
     * @param int $id Attachment ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAttachment(DeleteAttachmentRequest $request, int $id)
    {
        $this->contributionService->deleteAttachment($id);
        return $this->response(null, 'Attachment deleted successfully');
    }

    /**
     * Leave a project
     * 
     * @param LeaveProjectRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function leave(LeaveProjectRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::user()->id;
        $result = $this->contributionService->leaveProject($data);
        return $this->response(null, $result['message']);
    }

    /**
     * Download an attachment
     * 
     * @param int $id Attachment ID
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function downloadAttachment(int $id)
    {
        try {
            $attachment = \App\Models\ContributionAttachment::findOrFail($id);
            $fileService = app(\App\Services\FileService::class);

            // Get the file path
            $filePath = $attachment->file_path;

            // Check if file exists
            if (!$fileService->fileExists($filePath)) {
                return $this->response(null, 'File not found', 404);
            }

            // Get the storage disk
            $disk = $fileService->getDisk();
            $storage = \Illuminate\Support\Facades\Storage::disk($disk);

            // Get file contents
            $fileContents = $storage->get($filePath);

            if ($fileContents === false) {
                return $this->response(null, 'Failed to read file', 500);
            }

            // Get MIME type
            $mimeType = $storage->mimeType($filePath) ?? 'application/octet-stream';

            // Return file download response
            return response($fileContents, 200)
                ->header('Content-Type', $mimeType)
                ->header('Content-Disposition', 'attachment; filename="' . $attachment->file_name . '"')
                ->header('Content-Length', strlen($fileContents));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->response(null, 'Attachment not found', 404);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to download attachment: ' . $e->getMessage());
            return $this->response(null, 'Failed to download attachment', 500);
        }
    }
}
