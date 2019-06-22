@extends('layouts.app')

@section('breadcrumb')
    <div id="breadcrumb">
        <a href="{{ route("home") }}" class="nes-text is-primary">Homepage</a>
        <span>Library</span>
        <span>Authors</span>
        <a href="{{ route("books.by_author", ["slug"=> $author->slug]) }}"
           class="nes-text is-primary">{{ Str::limit($author->full_name, 50) }}</a>
    </div>
@endsection

@section('body')
    {{ $books->total() }} books.
    <ul class="books-list">
        @each('library._books_list', $books, 'book')
    </ul>
    {{  $books->links() }}
@endsection

