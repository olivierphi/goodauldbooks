<?php

if (getenv('PHP_CS_FIXER_CHECK_ALL')) {
    // Let's check (almost) all our files!
    $finder = \PhpCsFixer\Finder::create()
        ->notPath('vendor')
        ->notPath('public')
        ->notPath('resources')
        ->notPath('storage')
        ->notPath('bootstrap/cache')
        ->in(__DIR__)
    ;
} else {
    // By default, we will only check files modified since last commit.
    $finder = FilesModifiedSinceLastCommitFinder::create();
}

return \PhpCsFixer\Config::create()
    ->setRules([
        '@Symfony' => true,
        // PSR2/Symfony code styles rules blacklisting:
        'phpdoc_align' => false,
        // Additional code style rules whitelisting:
        'array_syntax' => ['syntax' => 'short'],
        'concat_space' => ['spacing' => 'one'],
        'ordered_imports' => true,
    ])
    ->setFinder($finder)
;

class FilesModifiedSinceLastCommitFinder extends \Symfony\Component\Finder\Finder
{
    const FILES_TO_FIX_EXTENSIONS = ['php'];

    /**
     * {@inheritdoc}
     */
    public function getIterator()
    {
        $filesModifiedSinceLastCommitRaw = shell_exec('git diff --name-only HEAD');
        $filesModifiedSinceLastCommit = array_filter(explode(PHP_EOL, $filesModifiedSinceLastCommitRaw));

        $iterator = new \ArrayIterator();
        foreach ($filesModifiedSinceLastCommit as $filePath) {
            if (!file_exists($filePath) || !in_array(pathinfo($filePath, PATHINFO_EXTENSION), self::FILES_TO_FIX_EXTENSIONS)) {
                continue;
            }
            $iterator->append(new \SplFileInfo($filePath));
        }

        return $iterator;
    }
}
