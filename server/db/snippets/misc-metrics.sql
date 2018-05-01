-- nb books by lang:
with
nb_books as (
  select count(*) as nb_books_total from library.book
),
grouped_books as (
  select
    lang,
    count(*) as nb,
    (count(*) * 100::real / nb_books_total)::numeric(5, 2) as percent
  from
    library.book,
    nb_books
  group by
    nb_books_total,
    lang
)
select
  lang, nb as nb_books_for_this_lang, percent
from
  grouped_books
order by
  nb desc
;

-- literary genres with more than one book:
with
grouped_genres as (
  select
    title, count(*) as nb
  from
    library.book_genres
      join library.genre using(genre_id)
  group by
    title
)
select
  title, nb as nb_books_for_this_genre
from
  grouped_genres
where
  nb > 1
order by
  nb desc
;

-- books for a given genre
-- (AP is "Periodicals" for instance)
-- @link https://www.loc.gov/aba/cataloging/classification/lcco/lcco_a.pdf
-- @link https://www.loc.gov/aba/cataloging/classification/lcco/lcco_p.pdf
select
  book.gutenberg_id,
  book.title
from
  library.book as book
  join library.book_genres as book_genres using(book_id)
  join library.genre as genre using (genre_id)
where
  genre.title = 'Horror tales';

-- books assets sizes:
with
total as (
  select
    count(*) as nb,
    sum(size) as size
  from
    library.book_asset
),
asset_type as (
  select
    distinct(type) as type
  from
    library.book_asset
),
metrics_by_asset_type as (
  select
    type,
    count(*) as nb,
    sum(size) as sum
  from
    library.book_asset
  group by
    type
),
percentages as (
  select
    type,
    (metrics.nb * 100::real / total.nb) as nb,
    (metrics.sum * 100::real / total.size) as size
  from
    total,
    metrics_by_asset_type as metrics
),
all_raw as (
  (
    select
      'Total' as type,
      nb,
      100 as nb_percent,
      size,
      100 as size_percent
    from
      total
  )
  union all
  (
    select
      asset_type.type,
      metrics.nb,
      percentages.nb as nb_percent,
      metrics.sum as size,
      percentages.size as size_percent
    from
      asset_type
      join
      metrics_by_asset_type as metrics using (type)
      join
        percentages using (type)
    order by
      size desc
  )
)
select
  type,
  nb,
  format('%s %%', nb_percent::numeric(5,2)) as nb_percent,
  pg_size_pretty(size) as size,
  format('%s %%', size_percent::numeric(5,2)) as size_percent
from
  all_raw
;


-- Author with multiple books:
with
author_with_nb_books as (
  select
    author_id,
    format('%s %s', author.first_name, author.last_name) as author_name,
    count(author_id) as nb_books
  from
    library.author as author
    join
      library.book using (author_id)
  group by
    author_id
)
select
  author_id,
  author_name,
  nb_books
from
  author_with_nb_books
where
  nb_books > 1
order by
  nb_books desc;
