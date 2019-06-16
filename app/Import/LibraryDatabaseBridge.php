<?php

namespace App\Import;

use App\Library\Author as AuthorModel;
use App\Library\Book as BookModel;
use App\Library\Genre as GenreModel;
use Illuminate\Support\Str;

class LibraryDatabaseBridge
{
    /**
     * If `true`, rather than using SQL queries to check whether an author is already in the database or not
     * we will store their ids in a (huge) PHP array.
     *
     * @var bool
     */
    public $keepExistingAuthorsTrackingInMemory = true;
    /**
     * Same, for literary genres.
     *
     * @var bool
     */
    public $keepExistingGenresTrackingInMemory = true;

    /**
     * An associate array, where keys are parsed authors ids.
     *
     * @var AuthorModel[]
     */
    private $existingAuthorsByIds = [];
    /**
     * An associate array, where keys are parsed genres ids.
     *
     * @var GenreModel[]
     */
    private $existingGenresByIds = [];

    public function storeBookInDatabase(ParsedBook $parsedBook, bool $saveAuthors = true, bool $saveGenres = true): BookModel
    {
        $bookSlugBase = Str::substr($parsedBook->title, 0, 240);
        $bookSlug = Str::slug($bookSlugBase . '-' . $parsedBook->id);
        $bookModel = BookModel::create([
            'public_id' => $parsedBook->id,
            'title' => $parsedBook->title,
            'lang' => $parsedBook->lang,
            'slug' => $bookSlug,
        ]);

        if ($saveAuthors) {
            $bookModel->authors()->saveMany(collect($parsedBook->authors)->map(function (ParsedAuthor $author) {
                return $this->storeAuthorInDatabase($author);
            }));
        }

        if ($saveGenres) {
            $bookModel->genres()->saveMany(collect($parsedBook->genres)->map(function (ParsedGenre $genre) {
                return $this->storeGenreInDatabase($genre);
            }));
        }

        return $bookModel;
    }

    public function storeAuthorInDatabase(ParsedAuthor $parsedAuthor): AuthorModel
    {
        if ($this->keepExistingAuthorsTrackingInMemory) {
            if (array_key_exists($parsedAuthor->id, $this->existingAuthorsByIds)) {
                return $this->existingAuthorsByIds[$parsedAuthor->id];
            }
        } else {
            $existingAuthorInDatabaseQuery = AuthorModel::where(['public_id' => $parsedAuthor->id]);
            if ($existingAuthorInDatabaseQuery->exists()) {
                return $existingAuthorInDatabaseQuery->first();
            }
        }

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

        if ($this->keepExistingAuthorsTrackingInMemory) {
            $this->existingAuthorsByIds[$parsedAuthor->id] = $authorModel;
        }

        return $authorModel;
    }

    public function storeGenreInDatabase(Parsedgenre $parsedGenre): GenreModel
    {
        if ($this->keepExistingGenresTrackingInMemory) {
            if (array_key_exists($parsedGenre->id, $this->existingGenresByIds)) {
                return $this->existingGenresByIds[$parsedGenre->id];
            }
        } else {
            $existingGenreInDatabaseQuery = GenreModel::where(['public_id' => $parsedGenre->id]);
            if ($existingGenreInDatabaseQuery->exists()) {
                return $existingGenreInDatabaseQuery->first();
            }
        }

        $genreSlugBase = Str::substr($parsedGenre->name, 0, 240);
        $genreSlug = Str::slug($genreSlugBase . '-' . $parsedGenre->id);

        $genreModel = GenreModel::create([
            'public_id' => $parsedGenre->id,
            'name' => $parsedGenre->name,
            'slug' => $genreSlug,
        ]);

        if ($this->keepExistingGenresTrackingInMemory) {
            $this->existingGenresByIds[$parsedGenre->id] = $genreModel;
        }

        return $genreModel;
    }
}
