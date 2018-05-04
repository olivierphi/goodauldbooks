/*
Want to profile SQL queries embedded in functions? Here we go:
goodauldbooks=# load 'auto_explain';
goodauldbooks=# set auto_explain.log_min_duration = 1;
goodauldbooks=# set auto_explain.log_nested_statements = on;

$ dc logs -f --tail=0 db

@link https://www.postgresql.org/docs/current/static/auto-explain.html
@link https://dba.stackexchange.com/questions/23355/postgres-query-plan-of-a-udf-invocation-written-in-pgpsql#answer-23357

Easier psql session:
set search_path to 'exts', 'library', 'api_public';
*/
-- nb books by lang:
with
nb_books as (
  select count(*) as nb_books_total from library.book
),
books_by_lang as (
  select
    lang,
    count(*) as nb
  from
    library.book
  group by
    lang
)
select
  lang, nb as nb_books_for_this_lang,
  format('%s %%', (nb * 100::real / nb_books_total)::numeric(5, 2)) as percent
from
  books_by_lang,
  nb_books
order by
  nb desc
;

-- books with same titles (potential duplicates) :
with
books_by_title as (
  select
    array_agg(book_id) as ids,
    title,
    count(*) as nb
  from
    library.book
  group by
    title
)
select
  title, nb, ids
from
  books_by_title
where
  nb > 1
order by
  nb desc
;

-- literary genres with more than one book:
with
grouped_genres as (
  select
    title, count(*) as nb
  from
    library.book_genre
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
  join library.book_genre as book_genre using(book_id)
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
