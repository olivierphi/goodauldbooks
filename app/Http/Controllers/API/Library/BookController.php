<?php

declare(strict_types=1);

namespace App\Http\Controllers\API\Library;

use App\Http\Controllers\Controller;
use App\Http\Resources\Library\Book as BookResource;
use App\Http\Resources\Library\BookCollection as BookCollectionResource;
use App\Library\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): BookCollectionResource
    {
        $include = $request->query->get('include', '');
        $includeArray = explode(',', $include);

        $booksQueryBuilder = Book::query();

        if (in_array('authors', $includeArray)) {
            $booksQueryBuilder = $booksQueryBuilder->with('authors');
        }
        if (in_array('genres', $includeArray)) {
            $booksQueryBuilder = $booksQueryBuilder->with('genres');
        }

        return new BookCollectionResource($booksQueryBuilder->paginate());
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book)
    {
        return new BookResource($book->load('authors', 'genres'));
    }
}
