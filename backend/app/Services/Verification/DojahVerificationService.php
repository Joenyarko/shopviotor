<?php

namespace App\Services\Verification;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class DojahVerificationService
{
    protected ?string $appId;
    protected ?string $secretKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->appId     = config('services.dojah.app_id');
        $this->secretKey = config('services.dojah.secret_key');
        $this->baseUrl   = rtrim(config('services.dojah.base_url', 'https://api.dojah.io'), '/');
    }

    /**
     * Check if Dojah credentials are live and configured.
     */
    public function isConfigured(): bool
    {
        return !empty($this->appId) && !empty($this->secretKey);
    }

    /**
     * Validate Ghana Card PIN format (NIA standard: GHA-XXXXXXXXX-X)
     */
    public static function isValidGhanaCardFormat(string $cardPin): bool
    {
        return (bool) preg_match('/^GHA-\d{9}-\d$/i', trim($cardPin));
    }

    /**
     * Verify Ghana Card using Dojah NIA Integration.
     *
     * @param string $cardPin (e.g. GHA-123456789-0)
     * @return array
     * @throws ValidationException
     */
    public function verifyGhanaCard(string $cardPin): array
    {
        $cardPin = strtoupper(trim($cardPin));

        if (!self::isValidGhanaCardFormat($cardPin)) {
            throw ValidationException::withMessages([
                'ghana_card_number' => ['Invalid Ghana Card PIN format. Must match GHA-XXXXXXXXX-X (e.g. GHA-123456789-0).'],
            ]);
        }

        // If Dojah live keys are not yet configured, provide fallback simulation mode
        if (!$this->isConfigured()) {
            Log::info("Dojah Verification: Running in sandbox/pre-live mode for Ghana Card [{$cardPin}].");
            return [
                'status'     => 'simulated',
                'verified'   => true,
                'card_pin'   => $cardPin,
                'reference'  => 'DOJAH_SANDBOX_' . uniqid(),
                'data'       => [
                    'id'         => $cardPin,
                    'status'     => 'pending_manual_verification',
                    'message'    => 'Recorded for official NIA validation upon live activation.',
                ],
            ];
        }

        try {
            $response = Http::withHeaders([
                'App-Id'        => $this->appId,
                'Authorization' => $this->secretKey,
                'Accept'        => 'application/json',
            ])->timeout(20)->get("{$this->baseUrl}/api/v1/kyc/gh/card", [
                'id' => $cardPin,
            ]);

            if ($response->successful()) {
                $body = $response->json();
                return [
                    'status'    => 'success',
                    'verified'  => true,
                    'card_pin'  => $cardPin,
                    'reference' => $body['entity']['reference'] ?? ('DOJAH_' . uniqid()),
                    'data'      => $body['entity'] ?? $body,
                ];
            }

            Log::warning("Dojah API Error for card {$cardPin}: " . $response->body());
            throw ValidationException::withMessages([
                'ghana_card_number' => ['Failed to verify Ghana Card against official NIA records. ' . ($response->json('error') ?? 'Please check the PIN.')],
            ]);
        } catch (\Exception $e) {
            if ($e instanceof ValidationException) throw $e;

            Log::error("Dojah Verification Exception: " . $e->getMessage());
            // Graceful fallback to record the verification request
            return [
                'status'    => 'pending_review',
                'verified'  => false,
                'card_pin'  => $cardPin,
                'reference' => 'DOJAH_FALLBACK_' . uniqid(),
                'message'   => 'Verification submitted and queued for review.',
            ];
        }
    }

    /**
     * Facial Match and Liveness Verification.
     * Compares live selfie against NIA photo or ID card image.
     */
    public function verifyFacialMatch(string $selfieBase64OrUrl, ?string $idImageBase64OrUrl = null): array
    {
        if (!$this->isConfigured()) {
            return [
                'status'     => 'simulated',
                'confidence' => 98.5,
                'match'      => true,
                'message'    => 'Biometric selfie captured and stored for onboarding.',
            ];
        }

        try {
            $payload = [
                'selfie_image' => $selfieBase64OrUrl,
            ];
            if ($idImageBase64OrUrl) {
                $payload['photoid_image'] = $idImageBase64OrUrl;
            }

            $response = Http::withHeaders([
                'App-Id'        => $this->appId,
                'Authorization' => $this->secretKey,
                'Accept'        => 'application/json',
            ])->timeout(25)->post("{$this->baseUrl}/api/v1/kyc/photoid/verify", $payload);

            if ($response->successful()) {
                $result = $response->json();
                return [
                    'status'     => 'success',
                    'confidence' => $result['entity']['confidence_value'] ?? 100,
                    'match'      => ($result['entity']['confidence_value'] ?? 0) >= 70,
                    'data'       => $result,
                ];
            }

            Log::warning("Dojah Facial Match Error: " . $response->body());
            return [
                'status'  => 'failed',
                'match'   => false,
                'message' => $response->json('error') ?? 'Facial match verification failed.',
            ];
        } catch (\Exception $e) {
            Log::error("Dojah Facial Match Exception: " . $e->getMessage());
            return [
                'status'  => 'error',
                'match'   => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}

