<?php

declare(strict_types=1);

namespace App\Library;

use Illuminate\Database\Eloquent\Builder;

class BookRepository implements BookRepositoryInterface
{
    public function booksByAuthor(int $authorId): Builder
    {
        return Book::query()->whereHas('authors', function (Builder $authorQuery) use ($authorId) {
            $authorQuery->where('id', $authorId);
        })
            ->orderBy('books.title');
    }

    public function booksByGenre(int $genreId): Builder
    {
        return Book::query()->whereHas('genres', function (Builder $genreQuery) use ($genreId) {
            $genreQuery->where('id', $genreId);
        })
            ->orderBy('books.title');
    }
}
