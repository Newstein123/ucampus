<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContributionNoteController\CreateContributionNoteRequest;
use App\Http\Requests\ContributionNoteController\DeleteContributionNoteRequest;
use App\Http\Requests\ContributionNoteController\ListContributionNotesRequest;
use App\Http\Requests\ContributionNoteController\UpdateContributionNoteRequest;
use App\Http\Resources\ContributionNoteResource;
use App\Services\ContributionNoteServiceInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;

class ContributionNoteController extends Controller
{
    public function __construct(
        protected ContributionNoteServiceInterface $noteService
    ) {}

    /**
     * List notes for a contribution
     */
    public function index(ListContributionNotesRequest $request)
    {
        try {
            $data = $request->validated();
            $notes = $this->noteService->list(
                $data['contribution_id'],
                Auth::user()->id,
                $data['per_page'] ?? 10,
                $data['page'] ?? 1,
                $data['content_key'] ?? null
            );

            return $this->response(
                ContributionNoteResource::collection($notes),
                'Notes fetched successfully'
            );
        } catch (AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Create a new note
     */
    public function store(CreateContributionNoteRequest $request)
    {
        try {
            $data = $request->validated();
            $data['user_id'] = Auth::user()->id;
            
            $note = $this->noteService->create($data);
            $note->load('user');

            return $this->response(
                new ContributionNoteResource($note),
                'Note created successfully'
            );
        } catch (AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Update a note
     */
    public function update(UpdateContributionNoteRequest $request, int $id)
    {
        try {
            $data = $request->validated();
            $note = $this->noteService->update($id, Auth::user()->id, $data);
            $note->load('user');

            return $this->response(
                new ContributionNoteResource($note),
                'Note updated successfully'
            );
        } catch (AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Delete a note
     */
    public function destroy(DeleteContributionNoteRequest $request, int $id)
    {
        try {
            $this->noteService->delete($id, Auth::user()->id);

            return $this->response(null, 'Note deleted successfully');
        } catch (AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Resolve a note (only owner can resolve)
     */
    public function resolve(int $id)
    {
        try {
            $note = $this->noteService->resolve($id, Auth::user()->id);
            $note->load(['user', 'resolver']);

            return $this->response(
                new ContributionNoteResource($note),
                'Note resolved successfully'
            );
        } catch (AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Reject a note (only owner can reject)
     */
    public function reject(int $id)
    {
        try {
            $note = $this->noteService->reject($id, Auth::user()->id);
            $note->load(['user', 'resolver']);

            return $this->response(
                new ContributionNoteResource($note),
                'Note rejected successfully'
            );
        } catch (AuthorizationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
