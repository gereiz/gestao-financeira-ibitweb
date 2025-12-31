<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $system_settings['app_name'] ?? config('app.name', 'Laravel') }}</title>

        @php
            $favicon = \App\Models\SystemSetting::get('favicon_path');
            $faviconUrl = $favicon ? \Illuminate\Support\Facades\Storage::url($favicon) : '/favicon.ico';
        @endphp
        <link rel="icon" href="{{ $faviconUrl }}">

        <!-- Fonts -->
        @if(isset($system_settings['font_family']))
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family={{ urlencode($system_settings['font_family']) }}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: '{{ $system_settings['font_family'] }}', sans-serif !important;
                }
            </style>
        @else
            <link rel="preconnect" href="https://fonts.bunny.net">
            <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        @endif

        @if(isset($system_settings['primary_color']))
            <style>
                :root {
                    --primary-color: {{ $system_settings['primary_color'] }};
                    /* Generate darker/lighter shades if needed, or just use one for now */
                }
                /* Override Tailwind colors if using CSS variables mapping */
            </style>
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
