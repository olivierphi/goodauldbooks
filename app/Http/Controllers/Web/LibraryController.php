<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Library\Author;
use App\Library\Book;
use App\Library\BookRepositoryInterface;
use App\Library\Genre;
use function view;

class LibraryController
{
    /**
     * @var BookRepositoryInterface
     */
    private $bookRepository;

    public function __construct(BookRepositoryInterface $bookRepository)
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
