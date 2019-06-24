<?php

namespace App\Library;

interface LibraryRepositoryInterface
{
    public function quickAutocompletion(string $pattern, string $lang = 'all'): array;
}
