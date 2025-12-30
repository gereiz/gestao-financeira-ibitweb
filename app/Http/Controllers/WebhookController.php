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

        if ($type === 'payment' && $id) {
            $accessToken = SystemSetting::get('mercadopago_access_token');
            
            if (!$accessToken) {
                Log::error('MercadoPago Webhook: Access Token not configured.');
                return response()->json(['status' => 'error', 'message' => 'Config error'], 500);
            }

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
        }

        return response()->json(['status' => 'ok']);
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
        $plan = Plan::find($data['plan_id']);

        if ($user && $plan) {
            // Atualizar usuário
            $user->plan_id = $plan->id;
            
            // Definir expiração com base no período do plano
            $expiresAt = $plan->billing_period === 'monthly' 
                ? Carbon::now()->addMonth() 
                : Carbon::now()->addYear();

            $user->plan_expires_at = $expiresAt;
            $user->save();

            Log::info("Plan activated for user {$user->id}: {$plan->name}, expires at {$expiresAt}");
        } else {
            Log::error('MercadoPago Webhook: User or Plan not found', $data);
        }
    }
}
