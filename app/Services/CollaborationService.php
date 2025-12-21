<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Contribution;
use App\Models\Notification;
use App\Repositories\CollaborationRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\DB;

class CollaborationService implements CollaborationServiceInterface
{
    public function __construct(
        private CollaborationRepositoryInterface $collaborationRepository
    ) {}

    public function sendRequest(int $contributionId, int $userId, string $reason): array
    {
        try {
            DB::beginTransaction();

            // Create collaboration request
            $result = $this->collaborationRepository->createRequest([
                'contribution_id' => $contributionId,
                'user_id' => $userId,
                'reason' => $reason,
                'status' => 0, // Pending
            ]);

            // Get contribution to find owner
            $contribution = Contribution::with('user')->find($contributionId);
            
            if ($contribution && $contribution->user) {
                // Create notification for project owner
                $notification = Notification::create([
                    'recipient_user_id' => $contribution->user_id,
                    'sender_user_id' => $userId,
                    'type' => 'collaboration_request',
                    'source_id' => $result['id'],
                    'source_type' => 'ContributionParticipant',
                    'message' => "requested to join your project \"{$contribution->title}\"",
                    'redirect_url' => "/contribution/request/{$result['id']}",
                    'is_read' => false,
                ]);

                // Broadcast real-time notification
                broadcast(new NotificationCreated($notification));
            }

            DB::commit();

            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function handleAction(int $requestId, int $status): array
    {
        try {
            DB::beginTransaction();

            // Update request status
            $result = $this->collaborationRepository->updateRequestStatus($requestId, $status);

            // Get the request details to send notification
            $participant = \App\Models\ContributionParticipant::with(['user', 'contribution'])->find($requestId);
            
            if ($participant && $participant->contribution) {
                $statusText = $status === 1 ? 'accepted' : 'rejected';
                
                // Update the original collaboration_request notification to mark as handled
                Notification::where('source_id', $requestId)
                    ->where('source_type', 'ContributionParticipant')
                    ->where('type', 'collaboration_request')
                    ->update([
                        'type' => $status === 1 ? 'collaboration_request_accepted' : 'collaboration_request_rejected',
                        'message' => $status === 1 
                            ? "{$participant->user->name} has been accepted to join \"{$participant->contribution->title}\""
                            : "Request from {$participant->user->name} to join \"{$participant->contribution->title}\" was rejected",
                    ]);
                
                // Create notification for requester
                $notification = Notification::create([
                    'recipient_user_id' => $participant->user_id,
                    'sender_user_id' => $participant->contribution->user_id,
                    'type' => 'collaboration_response',
                    'source_id' => $requestId,
                    'source_type' => 'ContributionParticipant',
                    'message' => $status === 1 
                        ? "You've been accepted to join the project \"{$participant->contribution->title}\""
                        : "Your request to join the project \"{$participant->contribution->title}\" was rejected.",
                    'redirect_url' => "/contribution/{$participant->contribution_id}",
                    'is_read' => false,
                ]);

                // Broadcast real-time notification
                broadcast(new NotificationCreated($notification));
            }

            DB::commit();

            return [
                'status' => $status,
                'message' => $status === 1 ? 'Request approved' : 'Request rejected',
            ];
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getList(?int $status = null, ?int $userId = null): array
    {
        try {
            $filters = [];

            if ($status !== null) {
                $filters['status'] = $status;
            }

            if ($userId !== null) {
                $filters['user_id'] = $userId;
            }

            return $this->collaborationRepository->getCollaborations($filters);
        } catch (Exception $e) {
            throw $e;
        }
    }
}
