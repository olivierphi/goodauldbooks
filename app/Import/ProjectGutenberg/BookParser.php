<?php

namespace App\Import\ProjectGutenberg;

use App\Import\ParsedAuthor;
use App\Import\ParsedBook;
use App\Import\ParsedGenre;
use ErrorException;
use Illuminate\Support\Arr;
use SimpleXMLElement;

class BookParser
{
    public static function parseBookFromRdf(string $rdfFilePath): ?ParsedBook
    {
        $rdfFileContent = file_get_contents($rdfFilePath);
        $rdfFileXmlContent = new SimpleXMLElement($rdfFileContent);

        $book = self::parseBookFromRdfFileXmlContent($rdfFileXmlContent);

        return $book;
    }

    /**
     * @param SimpleXMLElement $rdfFileXmlContent
     *
     * @return ParsedBook|null
     */
    private static function parseBookFromRdfFileXmlContent(SimpleXMLElement $rdfFileXmlContent)
    {
        $book = new ParsedBook();

        $bookTitle = $rdfFileXmlContent->xpath('//dcterms:title');
        if (!$bookTitle) {
            return null;
        }

        $book->title = (string) $bookTitle[0];
        $book->id = 'pg:' . Arr::last(explode('/', (string) $rdfFileXmlContent->xpath('/rdf:RDF/pgterms:ebook/@rdf:about')[0]));
        $book->lang = (string) $rdfFileXmlContent->xpath('//dcterms:language/rdf:Description/rdf:value')[0];
        $book->authors = self::parseAuthorsFromRdfFileXmlContent($rdfFileXmlContent);
        $book->genres = self::parseGenresFromRdfFileXmlContent($rdfFileXmlContent);

        return $book;
    }

    /**
     * @param SimpleXMLElement $rdfFileXmlContent
     *
     * @return ParsedAuthor[]
     */
    private static function parseAuthorsFromRdfFileXmlContent(SimpleXMLElement $rdfFileXmlContent): array
    {
        $parsedAuthors = [];

        $authors = $rdfFileXmlContent->xpath('//pgterms:agent');
        foreach ($authors as $i => $author) {
            $parsedAuthor = new ParsedAuthor();

            // id
            $authorGutenbergUri = $author->xpath('//pgterms:agent/@rdf:about')[$i];
            if ($authorGutenbergUri) {
                $parsedAuthor->id = 'pg:' . Arr::last(explode('/', $authorGutenbergUri['about']));
            } else {
                continue;
            }

            // first/last name
            $authorName = (string) $author->xpath('//pgterms:name')[$i];
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
                $authorAlias = (string) $author->xpath('//pgterms:alias')[$i];
                if ($authorAlias) {
                    $parsedAuthor->alias = $authorAlias;
                }
            } catch (ErrorException $e) {
            }

            // birth/death year
            try {
                $birthDate = (int) $author->xpath('//pgterms:birthdate')[$i];
                if ($birthDate) {
                    $parsedAuthor->birthYear = $birthDate;
                }
            } catch (ErrorException $e) {
            }
            try {
                $deathDate = (int) $author->xpath('//pgterms:deathdate')[$i];
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
     * @return ParsedGenre[]
     */
    private static function parseGenresFromRdfFileXmlContent(SimpleXMLElement $rdfFileXmlContent): array
    {
        $parsedGenres = [];

        $genres = $rdfFileXmlContent->xpath('//dcterms:subject/rdf:Description/rdf:value');
        foreach ($genres as $i => $genre) {
            $parsedGenre = new ParsedGenre();

            $name = (string) $genre;
            if (!$name) {
                continue;
            }

            // Since literary genres have no idea in Project Gutenberg, let's compute one ourselves,
            // from their title: (adler32 should be a pretty valid candidate for that)
            $parsedGenre->id = 'pg:' . hash('adler32', $name);
            $parsedGenre->name = $name;

            $parsedGenres[] = $parsedGenre;
        }

        return $parsedGenres;
    }
}
