<?php

namespace App\Import;

use App\Library\Author as AuthorModel;
use App\Library\Book as BookModel;
use App\Library\BookMetadata;
use App\Library\Genre as GenreModel;
use Illuminate\Support\Str;

class LibraryDatabaseBridge
{
    /**
     * We will store the x first bytes of each book that has a txt (UTF8) version.
     */
    public const BOOK_INTRO_SIZE = 8000;

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

    public function storeBookInDatabase(BookToImport $bookToImport, bool $saveAuthors = true, bool $saveGenres = true): BookModel
    {
        $bookSlugBase = Str::substr($bookToImport->title, 0, 240);
        $bookSlug = Str::slug($bookSlugBase . '-' . $bookToImport->id);
        $bookModel = BookModel::create([
            'public_id' => $bookToImport->id,
            'title' => $bookToImport->title,
            'subtitle' => $bookToImport->subtitle ?: null,
            'lang' => $bookToImport->lang,
            'slug' => $bookSlug,
        ]);

        $this->handleBooMetadata($bookToImport, $bookModel);

        if ($saveAuthors) {
            $bookModel->authors()->saveMany(collect($bookToImport->authors)->map(function (AuthorToImport $author) {
                return $this->storeAuthorInDatabase($author);
            }));
        }

        if ($saveGenres) {
            $bookModel->genres()->saveMany(collect($bookToImport->genres)->map(function (GenreToImport $genre) {
                return $this->storeGenreInDatabase($genre);
            }));
        }

        return $bookModel;
    }

    public function storeAuthorInDatabase(AuthorToImport $authorToImport): AuthorModel
    {
        if ($this->keepExistingAuthorsTrackingInMemory) {
            if (array_key_exists($authorToImport->id, $this->existingAuthorsByIds)) {
                return $this->existingAuthorsByIds[$authorToImport->id];
            }
        } else {
            $existingAuthorInDatabaseQuery = AuthorModel::where(['public_id' => $authorToImport->id]);
            if ($existingAuthorInDatabaseQuery->exists()) {
                return $existingAuthorInDatabaseQuery->first();
            }
        }

        $authorSlugBase = Str::substr(implode('-', [$authorToImport->firstName, $authorToImport->lastName]), 0, 240);
        $authorSlug = Str::slug($authorSlugBase . '-' . $authorToImport->id);

        $authorModel = AuthorModel::create([
            'public_id' => $authorToImport->id,
            'first_name' => $authorToImport->firstName,
            'last_name' => $authorToImport->lastName,
            'birth_year' => $authorToImport->birthYear,
            'death_year' => $authorToImport->deathYear,
            'slug' => $authorSlug,
        ]);

        if ($this->keepExistingAuthorsTrackingInMemory) {
            $this->existingAuthorsByIds[$authorToImport->id] = $authorModel;
        }

        return $authorModel;
    }

    public function storeGenreInDatabase(GenreToImport $genreToImport): GenreModel
    {
        if ($this->keepExistingGenresTrackingInMemory) {
            if (array_key_exists($genreToImport->id, $this->existingGenresByIds)) {
                return $this->existingGenresByIds[$genreToImport->id];
            }
        } else {
            $existingGenreInDatabaseQuery = GenreModel::where(['public_id' => $genreToImport->id]);
            if ($existingGenreInDatabaseQuery->exists()) {
                return $existingGenreInDatabaseQuery->first();
            }
        }

        $genreSlugBase = Str::substr($genreToImport->name, 0, 240);
        $genreSlug = Str::slug($genreSlugBase . '-' . $genreToImport->id);

        $genreModel = GenreModel::create([
            'public_id' => $genreToImport->id,
            'name' => $genreToImport->name,
            'slug' => $genreSlug,
        ]);

        if ($this->keepExistingGenresTrackingInMemory) {
            $this->existingGenresByIds[$genreToImport->id] = $genreModel;
        }

        return $genreModel;
    }

    private function handleBooMetadata(BookToImport $bookToImport, BookModel $bookModel)
    {
        $getAsset = function (string $assetType) use ($bookToImport): ?BookAsset {
            foreach ($bookToImport->assets as $asset) {
                if ($asset->type === $assetType) {
                    return $asset;
                }
            }

            return null;
        };
        $getAssetSize = function (string $assetType) use ($bookToImport, &$getAsset): ?int {
            $asset = $getAsset($assetType);
            if ($asset) {
                return $asset->size;
            }

            return null;
        };

        $bookAsTxt = $getAsset(BookAsset::ASSET_TYPE_BOOK_AS_TXT);
        $hasIntro = null !== $bookAsTxt;
        if ($hasIntro) {
            // (drop first 6 bytes, since we don't want BOMs in our intros)
            $intro = substr(
                utf8_encode(
                    file_get_contents($bookAsTxt->path, false, null, 0, self::BOOK_INTRO_SIZE)
                ), 6);
        } else {
            $intro = null;
        }

        BookMetadata::create([
           'book_id' => $bookModel->id,
           'has_cover' => null !== $getAsset(BookAsset::ASSET_TYPE_COVER),
           'epub_size' => $getAssetSize(BookAsset::ASSET_TYPE_EPUB),
           'mobi_size' => $getAssetSize(BookAsset::ASSET_TYPE_MOBI),
            'intro' => $intro,
        ]);
    }
}
