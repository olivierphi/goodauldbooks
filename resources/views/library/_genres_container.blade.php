<div class="genres-container">
    @foreach($genres as $genre)
    <a href="{{ route("books.by_genre", ["genre"=> $genre->slug]) }}"
       class="genre {{ isset($full_width) && $full_width ? "full" : "" }} nes-badge">
        <span class="is-success" itemprop="genre">{{ $genre->name }}</span>
    </a>
    @endforeach
</div>
