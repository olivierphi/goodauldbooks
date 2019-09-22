<?php

namespace App\Import\ProjectGutenberg;

use App\Import\LibraryDatabaseBridge;
use FilesystemIterator;
use GlobIterator;

class GeneratedCollectionCrawler
{
    /**
     * @var LibraryDatabaseBridge
     */
    private $libraryDatabaseBridge;

    public function __construct(LibraryDatabaseBridge $libraryDatabaseBridge)
    {
        $this->libraryDatabaseBridge = $libraryDatabaseBridge;
    }

    public function parseGutenbergGeneratedCollection(string $collectionPath, int $limit = 0): \Generator
    {
        $iterator = new GlobIterator("${collectionPath}/**/*.rdf", FilesystemIterator::CURRENT_AS_PATHNAME);
        $filesParsedCount = 0;
        $createdBooksCount = 0;
        /* @var \SplFileInfo $rdfFile */
        foreach ($iterator as $rdfFilePath) {
            $book = BookRdfParser::parseBookFromRdf($rdfFilePath);
            ++$filesParsedCount;

            if ($book) {
                $book->assets = BookAssetsAnalyser::analyseBookAssets($rdfFilePath, $book->id);
                $this->libraryDatabaseBridge->storeBookInDatabase($book);
                ++$createdBooksCount;
            }
            yield [$filesParsedCount, $createdBooksCount];

            if ($filesParsedCount > $limit) {
                break;
            }
        }
    }
}
