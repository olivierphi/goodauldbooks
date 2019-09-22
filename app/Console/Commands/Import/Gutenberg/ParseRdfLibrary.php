<?php

namespace App\Console\Commands\Import\Gutenberg;

use App\Import\ProjectGutenberg\GeneratedCollectionCrawler;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ParseRdfLibrary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:gutenberg:parse_rdf_lib {collection_path} {--limit=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Parses RDF library from Project Gutenberg\'s "generated" collection';
    /**
     * @var GeneratedCollectionCrawler
     */
    private $generatedCollectionCrawler;

    /**
     * Create a new command instance.
     */
    public function __construct(GeneratedCollectionCrawler $generatedCollectionCrawler)
    {
        parent::__construct();
        $this->generatedCollectionCrawler = $generatedCollectionCrawler;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $collectionPath = realpath($this->argument('collection_path'));
        if (!is_dir($collectionPath)) {
            $this->error("'${collectionPath}' is not a directory.");
            exit();
        }
        $limit = (int) ($this->option('limit') ?? 0);

        $startTime = microtime(true);

        $filesParsedCount = $createdBooksCount = 0;
        $collectionCrawlingGenerator = $this->generatedCollectionCrawler->parseGutenbergGeneratedCollection($collectionPath, $limit);
        foreach ($collectionCrawlingGenerator as [$filesParsedCount, $createdBooksCount]) {
            $this->output->write('.');
            if (0 === $filesParsedCount % 80) {
                $duration = round(microtime(true) - $startTime);
                $memory_usage = round(memory_get_usage() / 1000000);
                $this->info(" ${filesParsedCount} (${duration}s., ${memory_usage}MB)");
            }
        }

        $duration = round(microtime(true) - $startTime, 1);
        $this->info("\n${filesParsedCount} files parsed, ${createdBooksCount} books created in ${duration}s.");
        $authorsCount = DB::table('authors')->count();
        $genresCount = DB::table('genres')->count();
        $this->info("We have ${authorsCount} authors and ${genresCount} genres in the database.");
    }
}
