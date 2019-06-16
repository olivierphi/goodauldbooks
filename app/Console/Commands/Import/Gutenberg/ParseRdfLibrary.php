<?php

namespace App\Console\Commands\Import\Gutenberg;

use App\Import\LibraryDatabaseBridge;
use App\Import\ProjectGutenberg\BookParser;
use GlobIterator;
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

        $startTime = microtime(true);

        $iterator = new GlobIterator("${libraryPath}/**/*.rdf");
        $nbFilesParsed = 0;
        $nbBooksCreated = 0;
        /** @var \SplFileInfo $rdfFile */
        foreach ($iterator as $rdfFile) {
            $book = BookParser::parseBookFromRdf($rdfFile->getRealPath());

            $this->output->write('.');
            ++$nbFilesParsed;

            if ($book) {
                $this->libraryDatabaseBridge->storeBookInDatabase($book);
                ++$nbBooksCreated;
            }

            if (0 === $nbFilesParsed % 80) {
                $duration = round(microtime(true) - $startTime);
                $memory_usage = round(memory_get_usage() / 1000000);
                $this->info(" ${nbFilesParsed} (${duration}s., ${memory_usage}MB)");
            }
            if ($nbFilesParsed > 5000) {
                break;
            }
        }

        $duration = round(microtime(true) - $startTime, 1);
        $this->info("\n${nbFilesParsed} files parsed, ${nbBooksCreated} books created in ${duration}s.");
    }
}
