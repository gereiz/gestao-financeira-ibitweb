import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Habilita dark mode via classe 'dark'
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Cores customizadas estilo Mobills
                primary: {
                    50: 'color-mix(in srgb, var(--primary-color, #0284c7), white 90%)',
                    100: 'color-mix(in srgb, var(--primary-color, #0284c7), white 80%)',
                    200: 'color-mix(in srgb, var(--primary-color, #0284c7), white 60%)',
                    300: 'color-mix(in srgb, var(--primary-color, #0284c7), white 40%)',
                    400: 'color-mix(in srgb, var(--primary-color, #0284c7), white 20%)',
                    500: 'color-mix(in srgb, var(--primary-color, #0284c7), white 10%)',
                    600: 'var(--primary-color, #0284c7)',
                    700: 'color-mix(in srgb, var(--primary-color, #0284c7), black 10%)',
                    800: 'color-mix(in srgb, var(--primary-color, #0284c7), black 20%)',
                    900: 'color-mix(in srgb, var(--primary-color, #0284c7), black 30%)',
                },
                dark: {
                    bg: '#111827',
                    card: '#1f2937',
                    text: '#f3f4f6',
                }
            }
        },
    },

    plugins: [forms],
};
