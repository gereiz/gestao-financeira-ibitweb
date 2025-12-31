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

        // Se for plano recorrente, criar assinatura (Subscription)
        if ($plan->is_recurring) {
            if ($plan->mercadopago_plan_id) {
                return $this->createSubscription($user, $plan, $accessToken);
            } else {
                Log::error('Tentativa de assinatura em plano recorrente sem ID do Mercado Pago.', ['plan_id' => $plan->id]);
                return redirect()->back()->with('error', 'Este plano é recorrente, mas não está devidamente configurado no gateway de pagamento. Entre em contato com o suporte.');
            }
        }

        // Se não for recorrente, criar preferência de pagamento único (Checkout Pro)
        return $this->createPaymentPreference($user, $plan, $accessToken);
    }

    private function createSubscription($user, $plan, $accessToken)
    {
        try {
            // Em vez de redirecionar para o init_point do Plano (que não suporta external_reference dinâmico no URL),
            // criamos uma "Assinatura" (preapproval) específica para este usuário.
            
            $backUrl = route('checkout.success');
            // Ensure HTTPS in production
            if (!app()->environment('local') && str_starts_with($backUrl, 'http://')) {
                $backUrl = str_replace('http://', 'https://', $backUrl);
            }
            if (app()->environment('local') && (str_contains($backUrl, 'localhost') || str_contains($backUrl, '127.0.0.1'))) {
                $backUrl = 'https://www.google.com';
            }

            $externalRef = json_encode([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'type' => 'subscription'
            ]);

            $payload = [
                'preapproval_plan_id' => $plan->mercadopago_plan_id,
                'payer_email' => $user->email,
                'back_url' => $backUrl,
                'external_reference' => $externalRef,
                'status' => 'pending',
                'reason' => 'Assinatura ' . $plan->name,
            ];

            Log::info('Creating MP Subscription (Preapproval)', $payload);

            $response = Http::withToken($accessToken)->post('https://api.mercadopago.com/preapproval', $payload);

            if ($response->failed()) {
                Log::error('MP Create Subscription Error', ['body' => $response->body()]);
                return redirect()->back()->with('error', 'Erro ao iniciar assinatura. Tente novamente.');
            }

            $subscription = $response->json();
            
            if (!isset($subscription['init_point'])) {
                Log::error('MP Subscription missing init_point', ['response' => $subscription]);
                return redirect()->back()->with('error', 'Erro de configuração do gateway.');
            }

            $redirectUrl = $subscription['init_point'];

            Log::info('MercadoPago Subscription Redirect', ['url' => $redirectUrl]);

            return Inertia::location($redirectUrl);

        } catch (\Exception $e) {
            Log::error('Subscription Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Ocorreu um erro inesperado na assinatura.');
        }
    }

    private function createPaymentPreference($user, $plan, $accessToken)
    {
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
                'type' => 'payment'
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
        $preapprovalId = $request->query('preapproval_id'); // ID da assinatura recorrente
        $status = $request->query('status');
        
        $accessToken = SystemSetting::get('mercadopago_access_token');
        if (!$accessToken) {
            return redirect()->route('dashboard')->with('error', 'Erro de configuração do sistema.');
        }

        // Caso 1: Pagamento Único
        if ($paymentId && $status === 'approved') {
            try {
                // Verificar pagamento novamente para segurança
                $response = Http::withToken($accessToken)->get("https://api.mercadopago.com/v1/payments/{$paymentId}");
                
                if ($response->successful()) {
                    $payment = $response->json();
                    
                    if ($payment['status'] === 'approved') {
                        // Reutiliza a lógica do webhook para ativar
                        // Precisamos instanciar o WebhookController ou duplicar lógica
                        // Vamos duplicar simplificando pois o WebhookController é para eventos assíncronos
                        
                        $externalRef = $payment['external_reference'];
                        $data = json_decode($externalRef, true);
                        
                        if ($data && isset($data['user_id']) && isset($data['plan_id'])) {
                            $user = \App\Models\User::find($data['user_id']);
                            $plan = \App\Models\Plan::find($data['plan_id']);
                            
                            if ($user && $plan) {
                                $user->plan_id = $plan->id;
                                // Define expiração (cópia da lógica do Webhook)
                                $expiresAt = match ($plan->billing_period) {
                                    'monthly' => \Carbon\Carbon::now()->addMonth(),
                                    'quarterly' => \Carbon\Carbon::now()->addMonths(3),
                                    'semiannual' => \Carbon\Carbon::now()->addMonths(6),
                                    'yearly' => \Carbon\Carbon::now()->addYear(),
                                    default => \Carbon\Carbon::now()->addMonth(),
                                };
                                $user->plan_expires_at = $expiresAt;
                                $user->save();
                                
                                Log::info("Plan activated via success return for user {$user->id}");
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error('Success Page Payment Check Error: ' . $e->getMessage());
            }
        }
        
        // Caso 2: Assinatura Recorrente
        // O MP retorna preapproval_id na URL de sucesso para assinaturas
        if ($preapprovalId) {
            try {
                $response = Http::withToken($accessToken)->get("https://api.mercadopago.com/preapproval/{$preapprovalId}");
                
                if ($response->successful()) {
                    $subscription = $response->json();
                    
                    // Se estiver authorized (assinada)
                    if ($subscription['status'] === 'authorized') {
                         $externalRef = $subscription['external_reference'];
                         $data = json_decode($externalRef, true);
                         
                         if ($data && isset($data['user_id'])) {
                             $user = \App\Models\User::find($data['user_id']);
                             if ($user) {
                                 $user->mercadopago_subscription_id = $preapprovalId;
                                 
                                 // Ativa o plano também
                                 if (isset($data['plan_id'])) {
                                     $plan = \App\Models\Plan::find($data['plan_id']);
                                     if ($plan) {
                                         $user->plan_id = $plan->id;
                                          $expiresAt = match ($plan->billing_period) {
                                            'monthly' => \Carbon\Carbon::now()->addMonth(),
                                            'quarterly' => \Carbon\Carbon::now()->addMonths(3),
                                            'semiannual' => \Carbon\Carbon::now()->addMonths(6),
                                            'yearly' => \Carbon\Carbon::now()->addYear(),
                                            default => \Carbon\Carbon::now()->addMonth(),
                                        };
                                        $user->plan_expires_at = $expiresAt;
                                     }
                                 }
                                 
                                 $user->save();
                                 Log::info("Subscription linked via success return for user {$user->id}");
                             }
                         }
                    }
                }
            } catch (\Exception $e) {
                Log::error('Success Page Subscription Check Error: ' . $e->getMessage());
            }
        }

        return redirect()->route('dashboard')->with('success', 'Pagamento processado com sucesso! Seu plano será ativado em instantes.');
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
            
            $expiresAt = match ($plan->billing_period) {
                'monthly' => Carbon::now()->addMonth(),
                'quarterly' => Carbon::now()->addDays(90),
                'semiannual' => Carbon::now()->addDays(180),
                'yearly' => Carbon::now()->addYear(),
                default => Carbon::now()->addMonth(),
            };

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
