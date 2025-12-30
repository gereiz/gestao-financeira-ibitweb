<?php

namespace Database\Seeders;

use App\Models\LandingPageSection;
use Illuminate\Database\Seeder;

class LandingPageSeeder extends Seeder
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
                    'title' => 'Controle financeiro simples e eficiente',
                    'subtitle' => 'Organize suas finanças, alcance seus objetivos e tenha tranquilidade com o nosso sistema de gestão financeira.',
                    'cta_text' => 'Começar Agora Grátis',
                    'image_url' => 'https://static.organizze.com.br/site/images/hero-home-2023.webp', // Placeholder
                ],
                'is_visible' => true,
            ],
            [
                'key' => 'features',
                'content' => [
                    'title' => 'Tudo o que você precisa para controlar seu dinheiro',
                    'items' => [
                        [
                            'title' => 'Controle de Gastos',
                            'description' => 'Saiba exatamente para onde vai o seu dinheiro com categorias personalizáveis.',
                            'icon' => 'pie-chart',
                        ],
                        [
                            'title' => 'Relatórios Completos',
                            'description' => 'Visualize sua vida financeira em gráficos simples e intuitivos.',
                            'icon' => 'bar-chart',
                        ],
                        [
                            'title' => 'Metas e Orçamentos',
                            'description' => 'Defina limites de gastos e acompanhe seu progresso mensalmente.',
                            'icon' => 'target',
                        ],
                    ],
                ],
                'is_visible' => true,
            ],
            [
                'key' => 'testimonials',
                'content' => [
                    'title' => 'O que nossos usuários dizem',
                    'items' => [
                        [
                            'name' => 'Maria Silva',
                            'role' => 'Designer',
                            'quote' => 'Mudou a forma como lido com meu dinheiro. Super intuitivo!',
                            'avatar' => 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
                        ],
                        [
                            'name' => 'João Souza',
                            'role' => 'Desenvolvedor',
                            'quote' => 'Os relatórios são fantásticos. Consigo ver onde economizar.',
                            'avatar' => 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
                        ],
                    ],
                ],
                'is_visible' => true,
            ],
            [
                'key' => 'cta_footer',
                'content' => [
                    'title' => 'Pronto para assumir o controle?',
                    'subtitle' => 'Junte-se a milhares de pessoas que já organizaram suas finanças.',
                    'button_text' => 'Criar conta grátis',
                ],
                'is_visible' => true,
            ],
        ];

        foreach ($sections as $section) {
            LandingPageSection::updateOrCreate(
                ['key' => $section['key']],
                $section
            );
        }
    }
}
