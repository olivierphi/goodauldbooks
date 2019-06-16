<a href="{{ route("book", ["book"=> $book]) }}" class="book-cover">
        <span class="book-title">
            {{ Str::limit($book->title, 50) }}
{{--            {% if book.subtitle %}--}}
{{--                <span class="book-subtitle">{{ book.subtitle|truncate(30, killwords=False) }}</span>--}}
{{--            {% endif %}--}}
        </span>
    @if(count($book->authors))
        <span class="author-name">{{ $book->authors[0]->full_name }}</span>
    @endif
</a>
