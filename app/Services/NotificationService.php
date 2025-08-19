<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Repositories\NotificationRepositoryInterface;
use Illuminate\Support\Facades\Log;

class NotificationService implements NotificationServiceInterface
{

    public function __construct(
        private NotificationRepositoryInterface $notificationRepository
    ) {}

    public function getNotifications(int $userId, array $filters = [])
    {
        return $this->notificationRepository->getNotifications($userId, $filters);
    }

    public function getUnreadCount(int $userId)
    {
        return $this->notificationRepository->getUnreadCount($userId);
    }

    public function markAsRead(int $notificationId)
    {
        return $this->notificationRepository->markAsRead($notificationId);
    }

    public function create(array $data)
    {
        Log::info('Notification data: ' . json_encode($data));
        $notification = $this->notificationRepository->create($data);
        Log::info('Notification created: ' . $notification->id);
        event(new NotificationCreated($notification));
        return $notification;
    }
}
