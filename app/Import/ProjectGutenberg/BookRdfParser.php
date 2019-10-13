<?php

declare(strict_types=1);

namespace App\Import\ProjectGutenberg;

use App\Import\AuthorToImport;
use App\Import\BookToImport;
use App\Import\GenreToImport;
use ErrorException;
use Illuminate\Support\Arr;
use SimpleXMLElement;

class BookRdfParser
{
    public const MODELS_PUBLIC_IDS_PREFIX = 'pg-';

    /**
     * @var bool
     */
    public static $keepGenresIdsFromNamesResolutionInMemory = true;

    /**
     * @var array a "genre name" => "genre id" associative array
     */
    private static $genresIdsFromNamesResolution = [];

    public static function parseBookFromRdf(string $rdfFilePath): ?BookToImport
    {
        $rdfFileContent = file_get_contents($rdfFilePath);
        $rdfFileXmlContent = new SimpleXMLElement($rdfFileContent);

        $book = self::parseBookFromRdfFileXmlContent($rdfFileXmlContent);

        return $book;
    }

    /**
     * @param SimpleXMLElement $rdfFileXmlContent
     *
     * @return BookToImport|null
     */
    private static function parseBookFromRdfFileXmlContent(SimpleXMLElement $rdfFileXmlContent)
    {
        $book = new BookToImport();

        $title = $rdfFileXmlContent->xpath('//dcterms:title');

        if (!$title) {
            return null;
        }

        // Title (could contain a subtitle, with ";" as separator)
        $book->title = (string) $title[0];
        if (false !== strpos($book->title, ';')) {
            [$book->title, $book->subtitle] = explode(';', $book->title);
        }
        foreach (['title', 'subtitle'] as $titleField) {
            if ($book->$titleField) {
                $book->$titleField = trim($book->$titleField);
            }
        }

        // Other books properties
        $bookIdRaw = (string) $rdfFileXmlContent->xpath('/rdf:RDF/pgterms:ebook/@rdf:about')[0];
        $book->id = self::MODELS_PUBLIC_IDS_PREFIX . Arr::last(explode('/', $bookIdRaw));
        $book->lang = (string) $rdfFileXmlContent->xpath('//dcterms:language/rdf:Description/rdf:value')[0];

        // related entities
        $book->authors = self::parseAuthorsFromRdfFileXmlContent($rdfFileXmlContent);
        $book->genres = self::parseGenresFromRdfFileXmlContent($rdfFileXmlContent);

        return $book;
    }

    /**
     * @param SimpleXMLElement $rdfFileXmlContent
     *
     * @return AuthorToImport[]
     */
    private static function parseAuthorsFromRdfFileXmlContent(SimpleXMLElement $rdfFileXmlContent): array
    {
        $parsedAuthors = [];

        $authors = $rdfFileXmlContent->xpath('//pgterms:agent');
        foreach ($authors as $i => $author) {
            $parsedAuthor = new AuthorToImport();

            // id
            $authorIdRaw = (string) $author->xpath('./@rdf:about')[0];
            if ($authorIdRaw) {
                $parsedAuthor->id = self::MODELS_PUBLIC_IDS_PREFIX . Arr::last(explode('/', (string) $authorIdRaw));
            } else {
                continue;
            }

            // first/last name
            $authorName = (string) $author->xpath('.//pgterms:name')[0];
            if ($authorName) {
                $firstNameAndLastName = false;
                foreach ([',', ' '] as $separator) {
                    if (false === strpos($authorName, $separator)) {
                        continue;
                    }
                    [$authorLastName, $authorFirstName] = explode($separator, $authorName);
                    $firstNameAndLastName = true;
                    break;
                }
                if ($firstNameAndLastName) {
                    $parsedAuthor->firstName = trim($authorFirstName);
                    $parsedAuthor->lastName = trim($authorLastName);
                } else {
                    $parsedAuthor->lastName = trim($authorName);
                }
            }

            // alias
            try {
                $authorAlias = (string) $author->xpath('.//pgterms:alias')[0];
                if ($authorAlias) {
                    $parsedAuthor->alias = $authorAlias;
                }
            } catch (ErrorException $e) {
            }

            // birth/death year
            try {
                $birthDate = (int) $author->xpath('.//pgterms:birthdate')[0];
                if ($birthDate) {
                    $parsedAuthor->birthYear = $birthDate;
                }
            } catch (ErrorException $e) {
            }
            try {
                $deathDate = (int) $author->xpath('.//pgterms:deathdate')[0];
                if ($deathDate) {
                    $parsedAuthor->deathYear = $deathDate;
                }
            } catch (ErrorException $e) {
            }

            $parsedAuthors[] = $parsedAuthor;
        }

        return $parsedAuthors;
    }

    /**
     * @param SimpleXMLElement $rdfFileXmlContent
     *
     * @return GenreToImport[]
     */
    private static function parseGenresFromRdfFileXmlContent(SimpleXMLElement $rdfFileXmlContent): array
    {
        $parsedGenres = [];

        $genres = $rdfFileXmlContent->xpath('//dcterms:subject/rdf:Description/rdf:value');
        foreach ($genres as $genre) {
            $parsedGenre = new GenreToImport();

            $name = (string) $genre;
            if (!$name) {
                continue;
            }

            // Since literary genres have no idea in Project Gutenberg, let's compute one ourselves,
            // from their title: (adler32 should be a pretty valid candidate for that)
            if (self::$keepGenresIdsFromNamesResolutionInMemory && array_key_exists($name, self::$genresIdsFromNamesResolution)) {
                $parsedGenre->id = self::$genresIdsFromNamesResolution[$name];
            } else {
                $parsedGenre->id = self::MODELS_PUBLIC_IDS_PREFIX . hash('adler32', $name);
                if (self::$keepGenresIdsFromNamesResolutionInMemory) {
                    self::$genresIdsFromNamesResolution[$name] = $parsedGenre->id;
                }
            }

            $parsedGenre->name = $name;

            $parsedGenres[] = $parsedGenre;
        }

        return $parsedGenres;
    }
}
