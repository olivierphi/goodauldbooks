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
    genre_id, title, count(*) as nb
  from
    library.book_genre
      join library.genre using(genre_id)
  group by
    genre_id, title
)
select
  genre_id, title, nb as nb_books_for_this_genre
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
nb_books as (
  select
    count(*)::integer
  from
    library.book
),
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
      (nb * 100.00 / (select count from nb_books)) as percentage_of_books,
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
      (metrics.nb * 100.00 / (select count from nb_books)) as percentage_of_books,
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
  case
    when percentage_of_books > 100
      then ''
      else format('%s %%', percentage_of_books::numeric(5,2))
  end as percentage_of_books,
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

-- Books with the same title
with
books_by_title as (
  select
    title,
    count(*) as nb_books,
    array_agg(book_id) as books_ids,
    array_agg(lang) as books_langs
  from
    library.book
  group by
    title
  having
    count(*) > 1
)
select
  *
from
  books_by_title
order by
  nb_books desc
;

-- Nb genres
select
  count(*)
from
  library.genre
;

-- Nb langs
select
  count(distinct(lang))
from
  library.book
;

-- Nb genres by book (top 10)
with
nb_types_per_book as (
  select
    book_id,
    count(*) as nb_genres
  from
    library.book_genre
  group by
    book_id
)
select
  book_id,
  nb_genres
from
  nb_types_per_book
order by
  nb_genres desc
limit 10
;


-- Low-level: see the physical size of our tables
-- @link https://wiki.postgresql.org/wiki/Disk_Usage

-- > This will report size information for all tables [and materialized views], in both raw bytes and "pretty" form.
select
  *,
  pg_size_pretty(total_bytes) as total,
  pg_size_pretty(index_bytes) as index,
  pg_size_pretty(toast_bytes) as toast,
  pg_size_pretty(table_bytes) as table
from (
   select
     *,
     total_bytes - index_bytes - coalesce(toast_bytes, 0) as table_bytes
   from (
          select
            c.oid,
            nspname                               as table_schema,
            relname                               as table_name,
            c.reltuples                           as row_estimate,
            pg_total_relation_size(c.oid)         as total_bytes,
            pg_indexes_size(c.oid)                as index_bytes,
            pg_total_relation_size(reltoastrelid) as toast_bytes
          from pg_class c
            left join pg_namespace n on n.oid = c.relnamespace
          where relkind in ('r', 'm') and nspname not in ('pg_catalog', 'information_schema')
        ) a
 ) a;

-- > This version of the query uses pg_total_relation_size, which sums total disk space used by the table
-- > including indexes and toasted data rather than breaking out the individual pieces:
select
  nspname || '.' || relname                     as "relation",
  pg_size_pretty(pg_total_relation_size(c.oid)) as "total_size"
from pg_class c
  left join pg_namespace n on (n.oid = c.relnamespace)
where nspname not in ('pg_catalog', 'information_schema')
      and c.relkind <> 'i'
      and nspname !~ '^pg_toast'
order by pg_total_relation_size(c.oid) desc
limit 20;
