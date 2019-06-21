<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Library\Author as AuthorModel;
use App\Library\Book as BookModel;
use App\Library\BookRepository;
use App\Library\Genre as GenreModel;
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

    public function book(BookModel $book)
    {
        $book->load('authors', 'genres');

        return view('library.book', ['book' => $book]);
    }

    public function booksByAuthor(AuthorModel $author)
    {
        $authorBooks = $this->bookRepository->booksByAuthor($author->id)->get();

        return view('library.books_by_author', ['author' => $author, 'books' => $authorBooks]);
    }

    public function booksByGenre(GenreModel $genre)
    {
        $authorBooks = $this->bookRepository->booksByGenre($genre->id)->get();

        return view('library.books_by_genre', ['genre' => $genre, 'books' => $authorBooks]);
    }
}
