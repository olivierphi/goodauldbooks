<?php

namespace App\Import;

use App\Library\Author as AuthorModel;
use App\Library\Book as BookModel;
use Illuminate\Support\Str;

class LibraryDatabaseBridge
{
    public function storeBookInDatabase(ParsedBook $parsedBook): BookModel
    {
        $bookSlugBase = Str::substr($parsedBook->title, 0, 240);
        $bookSlug = Str::slug($bookSlugBase . '-' . $parsedBook->id);
        $bookModel = BookModel::create([
            'public_id' => $parsedBook->id,
            'title' => $parsedBook->title,
            'lang' => $parsedBook->lang,
            'slug' => $bookSlug,
        ]);

        $bookModel->authors()->saveMany(collect($parsedBook->authors)->map(function (ParsedAuthor $author) {
            return $this->storeAuthorInDatabase($author);
        }));

        return $bookModel;
    }

    public function storeAuthorInDatabase(ParsedAuthor $parsedAuthor): AuthorModel
    {
        $authorSlugBase = Str::substr(implode('-', [$parsedAuthor->firstName, $parsedAuthor->lastName]), 0, 240);
        $authorSlug = Str::slug($authorSlugBase . '-' . $parsedAuthor->id);

        $authorModel = AuthorModel::create([
            'public_id' => $parsedAuthor->id,
            'first_name' => $parsedAuthor->firstName,
            'last_name' => $parsedAuthor->lastName,
            'birth_year' => $parsedAuthor->birthYear,
            'death_year' => $parsedAuthor->deathYear,
            'slug' => $authorSlug,
        ]);

        return $authorModel;
    }
}
