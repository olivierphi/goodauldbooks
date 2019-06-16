@extends('layouts.app')

@section('breadcrumb')
    <div id="breadcrumb">
        <a href="{{ route("home") }}" class="nes-text is-primary">Homepage</a>
    </div>
@endsection

@section('body')
    <ul class="books-list">
        @each('library._books_list', $highlightedBooks, 'book')
    </ul>
@endsection

