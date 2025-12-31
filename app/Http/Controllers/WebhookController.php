<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\SystemSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handleMercadoPago(Request $request)
    {
        Log::info('MercadoPago Webhook Received', $request->all());

        $type = $request->input('type') ?? $request->input('topic');
        $id = $request->input('data.id') ?? $request->input('id');

        $accessToken = SystemSetting::get('mercadopago_access_token');
        if (!$accessToken) {
            Log::error('MercadoPago Webhook: Access Token not configured.');
            return response()->json(['status' => 'error', 'message' => 'Config error'], 500);
        }

        if ($type === 'payment' && $id) {
            // Consultar pagamento na API
            $response = Http::withToken($accessToken)->get("https://api.mercadopago.com/v1/payments/{$id}");

            if ($response->successful()) {
                $payment = $response->json();
                
                Log::info('MercadoPago Payment Details', ['status' => $payment['status'], 'external_ref' => $payment['external_reference'] ?? null]);

                if ($payment['status'] === 'approved') {
                    $this->activatePlan($payment);
                }
            } else {
                Log::error('MercadoPago Webhook: Failed to fetch payment details', ['id' => $id, 'body' => $response->body()]);
            }
        } elseif ($type === 'subscription_preapproval' && $id) {
            $this->handleSubscription($id, $accessToken);
        }

        return response()->json(['status' => 'ok']);
    }

    private function handleSubscription($id, $accessToken)
    {
        $response = Http::withToken($accessToken)->get("https://api.mercadopago.com/preapproval/{$id}");

        if ($response->successful()) {
            $subscription = $response->json();
            Log::info('MercadoPago Subscription Details', ['status' => $subscription['status'], 'external_ref' => $subscription['external_reference'] ?? null]);

            $externalReference = $subscription['external_reference'];
            $data = json_decode($externalReference, true);

            if ($data && isset($data['user_id'])) {
                $user = User::find($data['user_id']);
                if ($user) {
                    $user->mercadopago_subscription_id = $id;
                    $user->save();
                    Log::info("User {$user->id} linked to subscription {$id}");

                    // Ativar o plano se a assinatura estiver autorizada
                    if ($subscription['status'] === 'authorized') {
                        $this->activateUserPlan($user, $data['plan_id'] ?? null);
                    }
                }
            }
        } else {
            Log::error('MercadoPago Webhook: Failed to fetch subscription details', ['id' => $id, 'body' => $response->body()]);
        }
    }

    private function activatePlan($payment)
    {
        $externalReference = $payment['external_reference'];
        
        // Tentar decodificar JSON, ou usar string direta se for legado (mas aqui sempre envio JSON)
        $data = json_decode($externalReference, true);

        if (!$data || !isset($data['user_id']) || !isset($data['plan_id'])) {
            Log::warning('MercadoPago Webhook: Invalid external_reference', ['ref' => $externalReference]);
            return;
        }

        $user = User::find($data['user_id']);
        if ($user) {
            $this->activateUserPlan($user, $data['plan_id']);
        }
    }

    private function activateUserPlan($user, $planId)
    {
        if (!$planId) return;

        $plan = Plan::find($planId);

        if ($user && $plan) {
            // Atualizar usuário
            $user->plan_id = $plan->id;
            
            // Definir expiração com base no período do plano
            $expiresAt = match ($plan->billing_period) {
                'monthly' => Carbon::now()->addMonth(),
                'quarterly' => Carbon::now()->addMonths(3),
                'semiannual' => Carbon::now()->addMonths(6),
                'yearly' => Carbon::now()->addYear(),
                default => Carbon::now()->addMonth(),
            };

            $user->plan_expires_at = $expiresAt;
            $user->save();

            Log::info("Plan activated for user {$user->id}: {$plan->name}, expires at {$expiresAt}");
        } else {
            Log::error('MercadoPago Webhook: User or Plan not found for activation', ['user_id' => $user->id ?? 'null', 'plan_id' => $planId]);
        }
    }
}
