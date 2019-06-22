<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Library\Author;
use App\Library\Book;
use App\Library\BookRepository;
use App\Library\Genre;
use function view;

class LibraryController
{
    /**
     * @var BookRepository
     */
    private $bookRepository;

    public function __construct(BookRepository $bookRepository)
    {
        $this->bookRepository = $bookRepository;
    }

    public function book(Book $book)
    {
        return view('library.book', ['book' => $book]);
    }

    public function booksByAuthor(Author $author)
    {
        $authorBooks = $this->bookRepository->booksByAuthor($author->id)->paginate();

        return view('library.books_by_author', ['author' => $author, 'books' => $authorBooks]);
    }

    public function booksByGenre(Genre $genre)
    {
        $authorBooks = $this->bookRepository->booksByGenre($genre->id)->paginate();

        return view('library.books_by_genre', ['genre' => $genre, 'books' => $authorBooks]);
    }
}
