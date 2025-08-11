<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NotificationController\ListRequest;
use App\Http\Requests\NotificationController\ReadRequest;
use Illuminate\Http\Request;
use App\Services\NotificationServiceInterface;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\NotificationListResource;

class NotificationController extends Controller
{
    public function __construct(private NotificationServiceInterface $notificationService) {}

    public function index(ListRequest $request)
    {
        $userId = Auth::user()->id;
        $notifications = $this->notificationService->getNotifications($userId);
        return $this->response([
            'notifications' => NotificationListResource::collection($notifications),
            'pagination' => [
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ], 'Notifications fetched successfully');
    }

    public function read(ReadRequest $request)
    {
        $notificationId = $request->validated('notification_id');
        $this->notificationService->markAsRead($notificationId);
        return $this->response(null, 'Notifications marked as read');
    }

    public function unreadCount(Request $request)
    {
        $userId = Auth::user()->id;
        $unreadCount = $this->notificationService->getUnreadCount($userId);
        return $this->response([
            'unread_count' => $unreadCount,
        ], 'Unread count fetched successfully');
    }

    public function testNotification(Request $request)
    {
        $userId = Auth::user()->id;

        // Create a test notification
        $notification = $this->notificationService->create([
            'user_id' => $userId,
            'type' => 'test',
            'message' => 'This is a test notification from ' . now()->format('H:i:s'),
            'data' => [
                'test' => true,
                'timestamp' => now()->toISOString(),
            ],
        ]);

        return $this->response([
            'notification' => $notification,
        ], 'Test notification created successfully');
    }
}
