<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Library\Book;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $highlightedBooksIds = ['pg-345', 'pg-84'];
        $highlightedBooks = Book::with('authors')->whereIn('public_id', $highlightedBooksIds)->get();

        return view('home', ['highlightedBooks' => $highlightedBooks]);
    }
}
