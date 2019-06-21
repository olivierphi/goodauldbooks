<li class="book">
    <div class="card">
        <div class="card-image">
            @include("library._book_cover", ["book" => $book])
        </div>
        <div class="card-content">
            {{ Str::limit($book->title, 50)  }}
    {{--        {{ language(book.lang) }}--}}
    {{--        {{ book_pages_count(book.size) }}--}}

    {{--        {% with genres=book.genres.all()[0:2] %}--}}
    {{--        {{ genres_container(genres) }}--}}
    {{--        {% endwith %}--}}
        </div>
        <div class="card-action">
            <a href="{{ route("book", ["slug" => $book->slug]) }}" class="view-book-link nes-btn is-warning">
                View book
            </a>
        </div>
    </div>
</li>
