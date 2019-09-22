@extends('layouts.app')

@section('breadcrumb')
    <div id="breadcrumb">
        <a href="{{ route("home") }}" class="nes-text is-primary">Homepage</a>
        <span>Library</span>
        <span>Genres</span>
        <a href="{{ route("books.by_genre", ["genre"=> $genre->slug]) }}"
           class="nes-text is-primary">{{ Str::limit($genre->name, 50) }}</a>
    </div>
@endsection

@section('body')
    @include("library._books_list_with_pagination", ["books"=>$books])
@endsection

