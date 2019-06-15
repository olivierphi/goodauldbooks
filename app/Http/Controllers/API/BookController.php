<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\Book as BookResource;
use App\Http\Resources\BookCollection as BookCollectionResource;
use App\Library\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): BookCollectionResource
    {
        if ('authors' === $request->query->get('include')) {
            // Naive implementation of Authors conditional inclusion for the moment :-)
            $booksData = Book::with('authors');
        } else {
            $booksData = Book::query();
        }

        return new BookCollectionResource($booksData->paginate());
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book)
    {
        return new BookResource($book->load('authors'));
    }
}
