<?php

namespace App\Jobs;

use Exception;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class SendResetPasswordEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3; // Add retry attempts
    public $backoff = 10; // Wait 10 seconds between retries

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected User $user,
        protected string $resetUrl
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Mail::send('emails.reset-password', ['resetUrl' => $this->resetUrl], function ($message) {
                $message->to($this->user->email)
                    ->subject('Reset Your Password');
            });
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $e): void
    {
        // You can add failure handling logic here if needed
    }
}
