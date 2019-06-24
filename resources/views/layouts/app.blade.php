<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name') }}</title>
    <link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet">
    <script src="{{ mix('js/app.js') }}" defer></script>
    <link href="{{ mix('css/app.css') }}" rel="stylesheet">
</head>
<body>
<div id="container">

    <header id="header" data-turbolinks-permanent>
        <h1><a href="{{ route("home") }}">Good Auld Books</a></h1>

        <div class="nes-field">
            <label for="search_field">Search a book or an author:</label>
            <input type="text" id="search_field" class="nes-input"/>
        </div>
    </header>

    <main>
        @yield('breadcrumb')

        @yield('body')
    </main>
</div>
</body>
</html>
