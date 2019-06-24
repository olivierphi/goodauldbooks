<?php

namespace App\Http\Controllers\API\Library;

use App\Library\LibraryRepository;
use Illuminate\Http\Request;

class SearchController
{
    /**
     * @var LibraryRepository
     */
    private $libraryRepository;

    public function __construct(LibraryRepository $libraryRepository)
    {
        $this->libraryRepository = $libraryRepository;
    }

    public function quickAutocompletion(Request $request)
    {
        $pattern = $request->input('pattern');

        return $this->libraryRepository->quickAutocompletion($pattern);
    }
}
