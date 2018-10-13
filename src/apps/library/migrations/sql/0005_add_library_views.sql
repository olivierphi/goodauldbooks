
/**
 * N.B.
 * These "library_view" materialized views & projection tables
 * were grouped into a "library" Postgres schema in the previous version
 * of the code (mainly based on PostgREST), and having that schema to
 * namespace them allowed their names to be a bit less verbose.
 *
 * But the Django ORM is not very happy when we use Postgres schemas
 * - even if there are some workarounds -, so let's prefix all this stuff
 * instead of namespacing it in a dedicated schema...
 */

/**
 * Utils
 */
create extension if not exists unaccent;

create or replace function utils_slugify(
  base_string text
) returns text
immutable
language sql
as $function_slugify$
-- @link http://schinckel.net/2015/12/16/slugify%28%29-for-postgres-%28almost%29/ :-)
with
  normalized as (
    select unaccent('unaccent', base_string) as value
  ),
  remove_chars as (
    select regexp_replace(value, e'[^\\w\\s-]', '', 'gi') as value
    from normalized
  ),
  lowercase as (
    select lower(value) as value
    from remove_chars
  ),
  trimmed as (
    select trim(value) as value
    from lowercase
  ),
  hyphenated as (
    select regexp_replace(value, e'[-\\s]+', '-', 'gi') as value
    from trimmed
  )
select value from hyphenated;
$function_slugify$;

-- Now that we have that "utils_slugify" function we can proceed to
-- our real migration content...
-- Here we go!

create extension if not exists pg_trgm;


/**
 * Tables
 */
create table library_view_book_computed_data (
  book_id integer references library_book (book_id) primary key,
  slug varchar(50),
  has_intro boolean,
  cover_path varchar null,
  epub_path varchar,
  epub_size integer,
  mobi_path varchar,
  mobi_size integer
);

create table library_view_author_computed_data (
  author_id integer references library_author (author_id) primary key,
  full_name varchar,
  slug varchar(50),
  nb_books integer,
  highlight integer
);
-- Django "icontains" operation use upper-cased versions of the fields, so we have to index that same transform on our index:
create index author_computed_data_full_name_upper_idx on library_view_author_computed_data
  using gin((upper(full_name)) gin_trgm_ops);


/**
 * Views
 */

-- This materialized view has only 4 fields,
-- but the "nb_book_per_lang" is quite expensive to compute.
create materialized view library_view_genre_with_related_data as (
  with
  lang as (
    select
      distinct(lang) as lang
    from
      library_book
  )
  select
    genre_id::integer,
    title::varchar,
    count(nb_books_by_lang.lang)::integer as nb_langs,
    sum(nb_books_by_lang.nb_books)::integer as nb_books,
    jsonb_object(
      array_agg(nb_books_by_lang.lang),
      array_agg(nb_books_by_lang.nb_books::text)
    ) as nb_books_by_lang
  from
    library_genre as genre
    left join lateral (
      select
        lang.lang,
        count(book.book_id)::integer
      from
        lang
        join library_book as book on lang.lang = book.lang
        join library_book_genres using (book_id)
      where
        library_book_genres.genre_id = genre.genre_id
      group by
        lang.lang
      order by
        lang.lang asc
    ) nb_books_by_lang(lang, nb_books) on true
  group by
    genre_id
);
create unique index on library_view_genre_with_related_data
  (genre_id);
create unique index on library_view_genre_with_related_data
  (title);

/**
 * Functions
 */
create or replace function library_view_update_book_computed_data(
  book_id integer
) returns void
language sql
volatile
as $update_book_computed_data$
delete from
    library_view_book_computed_data
  where
    book_id = $1
;
with
book_with_assets_data as (
  select
    book.title as book_title,
    book_cover.path as book_cover_path,
    book_epub.path as book_epub_path,
    book_epub.size as book_epub_size,
    book_mobi.path as book_mobi_path,
    book_mobi.size as book_mobi_size
  from
    library_book as book
    left join
    library_book_asset as book_cover
      on (book.book_id = book_cover.book_id and book_cover.type = 'cover')
    left join
    library_book_asset as book_epub
      on (book.book_id = book_epub.book_id and book_epub.type = 'epub')
    left join
    library_book_asset as book_mobi
      on (book.book_id = book_mobi.book_id and book_mobi.type = 'mobi')
  where
    book.book_id = $1
),
book_slug_data as (
  select
    substring(utils_slugify(book_title) for 50)::varchar as slug
  from
    book_with_assets_data
),
book_intro as (
  select
    intro
  from
    library_book_additional_data
  where
    book_id = $1
)
insert into library_view_book_computed_data
(book_id, slug, has_intro, cover_path, epub_path, epub_size, mobi_path, mobi_size)
  select
    $1,
    (select slug from book_slug_data),
    case
      when (select count(*) from book_intro) > 0 and length((select intro from book_intro)) > 0
        then true
      else
        false
    end,
    book_cover_path,
    book_epub_path,
    book_epub_size,
    book_mobi_path,
    book_mobi_size
  from book_with_assets_data
;
$update_book_computed_data$;

create or replace function library_view_update_author_computed_data(
  author_id integer
) returns void
language sql
volatile
as $update_author_computed_data$
delete from
    library_view_author_computed_data
  where
    author_id = $1
;
with
author_nb_books as (
  select
    count(*) as count
  from
    library_book as book
  where
    book.author_id = $1
),
author_full_name as (
  select
    author.first_name || ' ' || author.last_name as full_name
  from
    library_author as author
  where
    author_id = $1
),
author_slug_data as (
  select
    substring(utils_slugify((select full_name from author_full_name)) for 50)::varchar as slug
  from
    library_author as author
  where
    author_id = $1
),
author_highlight as (
  select
    sum(highlight) as highlight
  from
    library_book as book
  where
    book.author_id = $1
)
insert into library_view_author_computed_data
(author_id, full_name, slug, nb_books, highlight)
  select
    $1,
    (select full_name from author_full_name),
    (select slug from author_slug_data),
    (select count from author_nb_books),
    (select highlight from author_highlight)
;
$update_author_computed_data$;

create or replace function library_view_update_all_books_computed_data(
) returns bigint
language sql
volatile
as $update_all_books_computed_data$
select
  count(*)
from
  library_book join lateral (
    select library_view_update_book_computed_data(book_id)
  ) upd8 on true
;
$update_all_books_computed_data$;

create or replace function library_view_update_all_authors_computed_data(
) returns bigint
language sql
volatile
as $update_all_authors_computed_data$
select
  count(*)
from
  library_author join lateral (
    select library_view_update_author_computed_data(author_id)
  ) upd8 on true
;
$update_all_authors_computed_data$;
