<?php

namespace App\Console\Commands\Import\Gutenberg;

use App\Import\LibraryDatabaseBridge;
use App\Import\ProjectGutenberg\BookParser;
use Illuminate\Console\Command;

class ParseRdfLibrary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:gutenberg:parse_rdf_lib {library_path}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Parses RDF library from Project Gutenberg "generated" collection';
    /**
     * @var LibraryDatabaseBridge
     */
    private $libraryDatabaseBridge;

    /**
     * Create a new command instance.
     */
    public function __construct(LibraryDatabaseBridge $libraryDatabaseBridge)
    {
        parent::__construct();
        $this->libraryDatabaseBridge = $libraryDatabaseBridge;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $libraryPath = realpath($this->argument('library_path'));
        if (!is_dir($libraryPath)) {
            $this->error("'${libraryPath}' is not a directory.");
            exit();
        }

        $iterator = new \GlobIterator("${libraryPath}/**/*.rdf");
        $nbFilesParsed = 0;
        /** @var \SplFileInfo $rdfFile */
        foreach ($iterator as $rdfFile) {
            $this->info($rdfFile->getFileName());
            $book = BookParser::parseBookFromRdf($rdfFile->getRealPath());

            if (!$book) {
                continue;
            }
            dump($book);
            if (count($book->authors) > 1) {
                exit();
            }

            $this->libraryDatabaseBridge->storeBookInDatabase($book);

            ++$nbFilesParsed;
            if ($nbFilesParsed > 50) {
                break;
            }
        }
    }
}
