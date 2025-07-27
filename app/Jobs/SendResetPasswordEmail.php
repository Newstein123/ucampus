<?php

namespace App\Jobs;

use Exception;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;

class SendResetPasswordEmail
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
            // Log the reset URL for debugging
            Log::info('Sending reset password email', [
                'user_email' => $this->user->email,
                'reset_url' => $this->resetUrl
            ]);

            Mail::send('emails.reset-password', ['resetUrl' => $this->resetUrl], function ($message) {
                $message->to($this->user->email)
                    ->subject('Reset Your Password');
            });

            Log::info('Reset password email sent successfully', [
                'user_email' => $this->user->email
            ]);
        } catch (Exception $e) {
            Log::error('Failed to send reset password email', [
                'user_email' => $this->user->email,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $e): void
    {
        Log::error('Reset password email job failed', [
            'user_email' => $this->user->email,
            'error' => $e->getMessage()
        ]);
    }
}
