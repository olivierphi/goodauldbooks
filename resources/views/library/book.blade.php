@extends('layouts.app')

@section('breadcrumb')
<div id="breadcrumb">
    <a href="{{ route("home") }}" class="nes-text is-primary">Homepage</a>
    <span>Library</span>
    <a href="{{ route("book", ["book"=> $book->slug]) }}"
        class="nes-text is-primary">{{ Str::limit($book->title, 50) }}</a>
</div>
@endsection

@section('body')
<main id="book-page" itemscope itemtype="http://schema.org/Book">

    <div class="book-content">

        <section class="book-main-info">
            <div class="book-cover-container">
                @include("library._book_cover", ["book"=>$book])
            </div>

            <div class="book-main-data">
                <h2 class="book-title" itemprop="name">{{ $book->title }}</h2>
                @isset($book->subtitle)
                    <h4 class="book-subtitle">{{ $book->subtitle }}</h4>
                @endisset

                @if(count($book->authors))
                <div class="authors">
                    @foreach($book->authors as $author)
                    <a href="{{ route("books.by_author", ["author"=> $author]) }}" class="author-name"
                        itemprop="author">
                        <i class="nes-kirby is-small"></i>
                        <span>
                            {{ $author->full_name }}
                            @if($author->birth_year or $author->death_year)
                            <i class="birth-death-years">
                                (@if($author->birth_year)<span
                                    itemprop="birthDate">{{ $author->birth_year }}</span>@else?@endif
                                -
                                @if($author->death_year)<span
                                    itemprop="deathDate">{{ $author->death_year }}</span>@else?@endif)</i>
                            @endif
                        </span>
                    </a>
                    @endforeach
                </div>
                @endif

            </div>

        </section>{{-- end .book-main-info --}}

        <section class="book-genres">
            <p class="genres-label">This book belongs to the following literary genres:</p>
            @include("library._genres_container", ["genres" => $book->genres, "full_width" => true])
        </section>{{-- end .book-genres --}}

        @if ($book->metadata->intro)
            <div class="book-intro-container">
                <span class="label">Intro</span>
                <div class="book-intro nes-container is-rounded">
                    <span class="intro">{{ $book->metadata->intro }} [...]</span>
                    <p class="read-more">Download the book to read more! ^_^</p>
                </div>
            </div>
        @endif

    </div>
</main>
@endsection
