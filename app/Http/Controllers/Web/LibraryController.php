<?php

namespace App\Http\Controllers\Web;

use App\Library\Book as BookModel;

class LibraryController
{
    public function book(BookModel $book)
    {
        $book->load('authors', 'genres');

        return view('library.book', ['book' => $book]);
    }
}
