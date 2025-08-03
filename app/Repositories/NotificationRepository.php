<?php

namespace App\Repositories;

use App\Models\Notification;

class NotificationRepository implements NotificationRepositoryInterface
{
    public function getNotifications(int $userId, array $filters = [])
    {
        $perPage = $filters['per_page'] ?? 10;
        $page = $filters['page'] ?? 1;

        $query = Notification::where('recipient_user_id', $userId);

        if (isset($filters['is_read'])) {
            $query->where('is_read', $filters['is_read']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
    }

    public function getUnreadCount(int $userId)
    {
        return Notification::where('recipient_user_id', $userId)->where('is_read', false)->count();
    }

    public function markAsRead(int $notificationId)
    {
        return Notification::where('id', $notificationId)->update(['is_read' => true]);
    }

    public function create(array $data)
    {
        return Notification::create($data);
    }
}
