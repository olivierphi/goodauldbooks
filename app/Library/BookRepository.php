<?php

declare(strict_types=1);

namespace App\Library;

use Illuminate\Database\Eloquent\Builder;

class BookRepository
{
    public function booksByAuthor(int $authorId): Builder
    {
        return Book::with('authors', 'genres')
            ->join('authors_books', 'authors_books.book_id', '=', 'books.id')
            ->where('authors_books.author_id', '=', $authorId);
    }

    public function booksByGenre(int $genreId): Builder
    {
        return Book::with('authors', 'genres')
            ->join('books_genres', 'books_genres.book_id', '=', 'books.id')
            ->where('books_genres.genre_id', '=', $genreId);
    }
}
