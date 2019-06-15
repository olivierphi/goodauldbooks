<?php

namespace App\Import;

use App\Library\Book;
use Illuminate\Support\Str;

class LibraryDatabaseBridge
{
    public function storeBookInDatabase(ParsedBook $parsedBook)
    {
        $bookSlug = Str::slug(Str::substr($parsedBook->title, 0, 240) . '-' . $parsedBook->id);
        $bookModel = Book::create([
            'public_id' => $parsedBook->id,
            'title' => $parsedBook->title,
            'lang' => $parsedBook->lang,
            'slug' => $bookSlug,
        ]);
    }
}
