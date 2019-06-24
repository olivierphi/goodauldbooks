<?php

namespace App\Library;

use Illuminate\Database\Eloquent\Builder;

interface BookRepositoryInterface
{
    public function booksByAuthor(int $authorId): Builder;

    public function booksByGenre(int $genreId): Builder;
}
