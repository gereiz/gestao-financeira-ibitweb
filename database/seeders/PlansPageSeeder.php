<?php

namespace Database\Seeders;

use App\Models\PlansPageSection;
use Illuminate\Database\Seeder;

class PlansPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sections = [
            [
                'key' => 'hero',
                'content' => [
                    'title' => 'Escolha o plano ideal para você',
                    'subtitle' => 'Comece gratuitamente e evolua conforme sua necessidade.',
                ],
                'is_visible' => true,
            ],
            [
                'key' => 'faq',
                'content' => [
                    'title' => 'Perguntas frequentes',
                    'items' => [
                        [
                            'question' => 'Posso cancelar a qualquer momento?',
                            'answer' => 'Sim, você pode cancelar sua assinatura a qualquer momento sem custos adicionais.',
                        ],
                        [
                            'question' => 'Preciso de cartão de crédito para testar?',
                            'answer' => 'Não, você pode começar com o plano gratuito sem informar dados de pagamento.',
                        ],
                    ],
                ],
                'is_visible' => true,
            ],
        ];

        foreach ($sections as $section) {
            PlansPageSection::updateOrCreate(
                ['key' => $section['key']],
                $section
            );
        }
    }
}
