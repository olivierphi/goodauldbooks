<?php

namespace App\Http\Controllers\API\Library;

use App\Library\LibraryRepositoryInterface;
use Illuminate\Http\Request;

class SearchController
{
    /**
     * @var LibraryRepositoryInterface
     */
    private $libraryRepository;

    public function __construct(LibraryRepositoryInterface $libraryRepository)
    {
        $this->libraryRepository = $libraryRepository;
    }

    public function quickAutocompletion(Request $request)
    {
        $pattern = $request->input('pattern');

        return $this->libraryRepository->quickAutocompletion($pattern);
    }
}
