<?php

namespace App\Console\Commands\Import\Gutenberg;

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
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
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
            \dump($book);
            if ($book && count($book->authors) > 1) {
                exit();
            }
            ++$nbFilesParsed;
            if ($nbFilesParsed > 50) {
                break;
            }
        }
    }
}
