<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    const ContibutionDetailUrl = 'contribution/';
    use HasFactory;

    protected $fillable = [
        'recipient_user_id',
        'sender_user_id',
        'type',
        'source_id',
        'source_type',
        'message',
        'is_read',
        'redirect_url',
    ];

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }
}
