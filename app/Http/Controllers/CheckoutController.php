<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\SystemSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function store(Request $request, $planId)
    {
        $plan = Plan::findOrFail($planId);
        $user = Auth::user();

        // Obter token das configurações
        $accessToken = SystemSetting::get('mercadopago_access_token');

        if (!$accessToken) {
            return redirect()->back()->with('error', 'Erro de configuração: Gateway de pagamento não configurado.');
        }

        $notificationUrl = route('webhook.mercadopago');
        // Em ambiente local sem https/tunnel, o Mercado Pago pode rejeitar ou falhar ao entregar
        // Para evitar erros de validação se houver restrições, removemos se for localhost
        if (str_contains($notificationUrl, 'localhost') || str_contains($notificationUrl, '127.0.0.1')) {
            $notificationUrl = null;
        }

        $preferenceData = [
            'items' => [
                [
                    'title' => 'Assinatura ' . $plan->name,
                    'quantity' => 1,
                    'unit_price' => (float) $plan->price,
                    'currency_id' => 'BRL',
                ]
            ],
            'payer' => [
                'email' => $user->email,
                'name' => $user->name,
            ],
            'back_urls' => [
                'success' => route('checkout.success'),
                'failure' => route('checkout.failure'),
                'pending' => route('checkout.pending'),
            ],
            'external_reference' => json_encode([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
            ]),
            'notification_url' => $notificationUrl,
            'statement_descriptor' => 'GESTAOFIN',
            'binary_mode' => true,
        ];

        // Auto return pode falhar em localhost dependendo da validação do MP
        if (!app()->environment('local')) {
            $preferenceData['auto_return'] = 'approved';
        }

        // Remove campos nulos
        $preferenceData = array_filter($preferenceData, fn($value) => !is_null($value));

        Log::info('MercadoPago Preference Payload', $preferenceData);

        try {
            $response = Http::withToken($accessToken)->post('https://api.mercadopago.com/checkout/preferences', $preferenceData);

            if ($response->failed()) {
                Log::error('MercadoPago Error', ['body' => $response->body()]);
                return redirect()->back()->with('error', 'Erro ao processar pagamento. Tente novamente mais tarde.');
            }

            $preference = $response->json();
            
            // Redireciona para o checkout do Mercado Pago
            // init_point para produção, sandbox_init_point para testes (se token começar com TEST)
            $redirectUrl = str_starts_with($accessToken, 'TEST') 
                ? $preference['sandbox_init_point'] 
                : $preference['init_point'];

            Log::info('MercadoPago Redirect URL', ['url' => $redirectUrl]);

            return Inertia::location($redirectUrl);

        } catch (\Exception $e) {
            Log::error('Checkout Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocorreu um erro inesperado.');
        }
    }

    public function success(Request $request)
    {
        Log::info('Checkout Success Route Hit', $request->all());

        $paymentId = $request->query('payment_id');
        $status = $request->query('status');
        
        // Em ambiente local ou se o webhook falhar, verificamos e ativamos no retorno
        if ($paymentId && $status === 'approved') {
            try {
                $accessToken = SystemSetting::get('mercadopago_access_token');
                
                if ($accessToken) {
                    $response = Http::withToken($accessToken)->get("https://api.mercadopago.com/v1/payments/{$paymentId}");
                    
                    if ($response->successful()) {
                        $payment = $response->json();
                        
                        if ($payment['status'] === 'approved') {
                            $this->activatePlan($payment);
                            return redirect()->route('dashboard')->with('success', 'Pagamento confirmado! Seu plano foi ativado.');
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error('Erro ao ativar plano no retorno: ' . $e->getMessage());
            }
        }
        
        return redirect()->route('dashboard')->with('info', 'Pagamento em processamento. Seu plano será ativado assim que confirmado.');
    }

    public function checkStatus()
    {
        $user = Auth::user();
        Log::info('CheckStatus initiated for user: ' . $user->id);
        
        try {
            $accessToken = SystemSetting::get('mercadopago_access_token');
            
            if (!$accessToken) {
                Log::error('CheckStatus: Token not found');
                return back()->with('error', 'Token de pagamento não configurado.');
            }

            Log::info('CheckStatus: Searching payments for email ' . $user->email);

            // Busca pagamentos aprovados recentes (geral da conta)
            // payer.email não é mais suportado como filtro direto na v1/payments/search em algumas versões
            // Então buscamos os últimos 20 e filtramos no código
            $response = Http::withToken($accessToken)->get('https://api.mercadopago.com/v1/payments/search', [
                'status' => 'approved',
                'sort' => 'date_created',
                'criteria' => 'desc',
                'limit' => 20
            ]);

            Log::info('CheckStatus: MP Response Status: ' . $response->status());

            if ($response->successful()) {
                $payments = $response->json()['results'] ?? [];
                Log::info('CheckStatus: Total payments fetched: ' . count($payments));
                
                foreach ($payments as $payment) {
                    // Verifica se o email bate ou se o user_id está na external_reference
                    $payerEmail = $payment['payer']['email'] ?? '';
                    $externalRef = $payment['external_reference'] ?? '';
                    
                    Log::info("CheckStatus: Inspecting payment {$payment['id']} - Email: {$payerEmail}");

                    $isUserPayment = false;

                    // Checa por email
                    if (strcasecmp($payerEmail, $user->email) === 0) {
                        $isUserPayment = true;
                    } 
                    // Se email falhar, checa external_reference
                    elseif ($externalRef && str_contains($externalRef, $user->id)) {
                         $isUserPayment = true;
                    }

                    if ($isUserPayment) {
                        Log::info('CheckStatus: Payment belongs to user: ' . $payment['id']);
                        
                        // Verifica data
                        $paymentDate = Carbon::parse($payment['date_created']);
                        $minutesDiff = $paymentDate->diffInMinutes(Carbon::now());
                        
                        // Aumentando para 24h para permitir ativação manual de pagamentos do dia
                        if ($minutesDiff <= 1440) {
                            $this->activatePlan($payment);
                            Log::info('CheckStatus: Activation attempted for payment ' . $payment['id']);
                            return redirect()->route('dashboard')->with('success', 'Pagamento localizado e plano ativado com sucesso!');
                        } else {
                            Log::info('CheckStatus: Payment found but too old (' . $minutesDiff . ' mins)');
                        }
                    }
                }
            } else {
                Log::error('CheckStatus: MP API Error: ' . $response->body());
            }
            
            return back()->with('error', 'Nenhum pagamento aprovado recente foi encontrado.');

        } catch (\Exception $e) {
            Log::error('Check Status Error: ' . $e->getMessage());
            return back()->with('error', 'Erro ao verificar pagamento: ' . $e->getMessage());
        }
    }

    private function activatePlan($payment)
    {
        Log::info('ActivatePlan: Started for payment ' . $payment['id']);
        $externalReference = $payment['external_reference'] ?? null;
        Log::info('ActivatePlan: External Reference: ' . ($externalReference ?? 'NULL'));

        $data = json_decode($externalReference, true);

        if (!$data || !isset($data['user_id']) || !isset($data['plan_id'])) {
            Log::error('ActivatePlan: Invalid external reference data');
            return;
        }

        $user = User::find($data['user_id']);
        $plan = Plan::find($data['plan_id']);

        if ($user && $plan) {
            $user->plan_id = $plan->id;
            
            $expiresAt = $plan->billing_period === 'monthly' 
                ? Carbon::now()->addMonth() 
                : Carbon::now()->addYear();

            $user->plan_expires_at = $expiresAt;
            $user->save();

            Log::info("Plan activated via Checkout Return for user {$user->id}. Plan: {$plan->name}, Expires: {$expiresAt}");
        } else {
            Log::error('ActivatePlan: User or Plan not found. UserID: ' . $data['user_id'] . ', PlanID: ' . $data['plan_id']);
        }
    }

    public function failure(Request $request)
    {
        return redirect()->route('pricing.index')->with('error', 'O pagamento falhou ou foi cancelado.');
    }

    public function pending(Request $request)
    {
        return redirect()->route('dashboard')->with('warning', 'Pagamento em processamento. Aguarde a confirmação.');
    }
}
