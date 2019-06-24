<?php

namespace App\Library;

use Illuminate\Database\ConnectionInterface;

class LibraryRepository implements LibraryRepositoryInterface
{
    /**
     * @var ConnectionInterface
     */
    private $databaseConnection;

    public function __construct(ConnectionInterface $databaseConnection)
    {
        $this->databaseConnection = $databaseConnection;
    }

    public function quickAutocompletion(string $pattern, string $lang = 'all'): array
    {
        $SQL = <<<'SQL'
with
books_search as (
  select
    'book' as type,
    books.id as book_id,
    books.title as book_title,
    books.lang as book_lang,
    books.slug as book_slug,
    authors.id as author_id,
    authors.first_name as author_first_name,
    authors.last_name as author_last_name,
    authors.slug as author_slug,
    3 as author_nb_books, -- TODO: denormalise "nb books" on authors
    0 as highlight -- TODO: handle "highlight" (which will be an editorial pass)
  from
    books
    join authors_books on books.id = authors_books.book_id
    join authors on authors_books.author_id = authors.id
  where
    books.title ilike concat('%', :pattern::text, '%') and
    case
      when :lang = 'all' then true
      else books.lang = :lang
    end
  order by
    case
      when books.title ilike concat(:pattern::text, '%') then 1
      else 0
    end desc,-- we give priority to books *starting* with the given pattern, and not only containing it
    highlight desc,
    book_title asc
  limit 8
),
authors_search as (
  select
    'author' as type,
    -1 as book_id,
    null as book_title,
    null as book_lang,
    null as book_slug,
    authors.id as author_id,
    authors.first_name as author_first_name,
    authors.last_name as author_last_name,
    authors.slug as author_slug,
    3 as author_nb_books, -- ditto
    0 as highlight -- ditto
  from
    authors
  where
    last_name ilike concat(:pattern::text, '%') or
    first_name ilike concat(:pattern::text, '%')
  order by
    highlight desc,
    author_nb_books desc,
    author_last_name asc
  limit 8
)
(
 select
   *
 from
   books_search
)
union all
(
 select
   *
 from
   authors_search
 order by
   highlight desc,
   author_nb_books desc,
   author_last_name asc
)
;
SQL;

        return $this->databaseConnection->select($SQL, ['pattern' => $pattern, 'lang' => $lang]);
    }
}
