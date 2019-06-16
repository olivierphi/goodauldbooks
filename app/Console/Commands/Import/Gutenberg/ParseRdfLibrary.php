<?php

namespace App\Console\Commands\Import\Gutenberg;

use App\Import\LibraryDatabaseBridge;
use App\Import\ProjectGutenberg\BookAssetsAnalyser;
use App\Import\ProjectGutenberg\BookRdfParser;
use GlobIterator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

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

        $iterator = new GlobIterator("${libraryPath}/**/*.rdf", \FilesystemIterator::CURRENT_AS_PATHNAME);
        $filesParsedCount = 0;
        $createdBooksCount = 0;
        /* @var \SplFileInfo $rdfFile */
        foreach ($iterator as $rdfFilePath) {
            $book = BookRdfParser::parseBookFromRdf($rdfFilePath);

            $this->output->write('.');
            ++$filesParsedCount;

            if ($book) {
                $book->assets = BookAssetsAnalyser::analyseBookAssets($rdfFilePath, $book->id);
                $this->libraryDatabaseBridge->storeBookInDatabase($book);
                ++$createdBooksCount;
            }

            if (0 === $filesParsedCount % 80) {
                $duration = round(microtime(true) - $startTime);
                $memory_usage = round(memory_get_usage() / 1000000);
                $this->info(" ${filesParsedCount} (${duration}s., ${memory_usage}MB)");
            }
            if ($filesParsedCount > 5000) {
                $this->warn("Hard-coded limit of books count while we're still in early stages of development :-)");
                break;
            }
        }

        $duration = round(microtime(true) - $startTime, 1);
        $this->info("\n${filesParsedCount} files parsed, ${createdBooksCount} books created in ${duration}s.");
        $authorsCount = DB::table('authors')->count();
        $genresCount = DB::table('genres')->count();
        $this->info("We have ${authorsCount} authors and ${genresCount} genres in the database.");
    }
}
