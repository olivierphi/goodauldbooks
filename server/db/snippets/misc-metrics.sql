-- nb books by lang:
with
nb_books as (
  select count(*) as nb_books_total from import.gutenberg_book
),
grouped_books as (
  select
    lang,
    count(*) as nb,
    (count(*) * 100::real / nb_books_total)::numeric(5, 2) as percent
  from
    import.gutenberg_book,
    nb_books
  group by
    nb_books_total,
    lang
)
select lang, nb as nb_books_for_this_lang, percent from grouped_books order by nb desc;

-- literary genres with more than one book:
with
grouped_genres as (
  select
    title, count(*) as nb
  from
    import.gutenberg_book_genres
      join import.gutenberg_genre using(genre_id)
  group by
    title
)
select title, nb as nb_books_for_this_genre from grouped_genres where nb > 1 order by nb desc;

-- books for a given genre
-- (AP is "Periodicals" for instance)
-- @link https://www.loc.gov/aba/cataloging/classification/lcco/lcco_a.pdf
-- @link https://www.loc.gov/aba/cataloging/classification/lcco/lcco_p.pdf
select
  book.gutenberg_id,
  book.title
from
  import.gutenberg_book as book
  join import.gutenberg_book_genres as book_genres using(book_id)
  join import.gutenberg_genre as genre using (genre_id)
where
  genre.title = 'AP';

-- books assets size:
with raw_sums as (
  select
    sum(size) as total,
    sum(size) filter (where type = 'cover') as covers,
    sum(size) filter (where type = 'epub') as epubs,
    sum(size) filter (where type = 'mobi') as mobis
  from
    import.gutenberg_book_asset
)
select
  pg_size_pretty(total) as total,
  pg_size_pretty(covers) as covers,
  format('%s%%', (covers * 100::real / total)::numeric(5, 2)) as covers_percent,
  pg_size_pretty(epubs) as epubs,
  format('%s%%', (epubs * 100::real / total)::numeric(5, 2)) as epubs_percent,
  pg_size_pretty(mobis) as mobis,
  format('%s%%', (mobis * 100::real / total)::numeric(5, 2)) as mobis_percent
from
  raw_sums;
