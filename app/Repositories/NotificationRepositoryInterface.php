<?php

namespace App\Repositories;

interface NotificationRepositoryInterface
{
    public function getNotifications(int $userId, array $filters = []);
    public function getUnreadCount(int $userId);
    public function markAsRead(int $notificationId);
    public function create(array $data);
}
