<?php

namespace App\Jobs;

use Exception;
use App\Models\User;
use Illuminate\Support\Facades\Log;
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
            Log::info('Attempting to send password reset email to: ' . $this->user->email);
            Log::info('Reset URL: ' . $this->resetUrl);

            Mail::send('emails.reset-password', ['resetUrl' => $this->resetUrl], function ($message) {
                $message->to($this->user->email)
                    ->subject('Reset Your Password');
            });

            Log::info('Password reset email sent successfully to: ' . $this->user->email);
        } catch (Exception $e) {
            Log::error('Reset password email failed: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $e): void
    {
        Log::error('Job failed finally after retries: ' . $e->getMessage());
    }
}
