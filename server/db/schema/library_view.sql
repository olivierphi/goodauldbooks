begin;

drop schema if exists library_view cascade;
create schema library_view;

create schema if not exists exts;
create extension if not exists pg_trgm schema exts;


create table library_view.book_computed_data (
  book_id integer references library.book (book_id) primary key,
  slug varchar(50),
  cover_path varchar null,
  epub_path varchar,
  epub_size integer,
  mobi_path varchar,
  mobi_size integer
);

create table library_view.author_computed_data (
  author_id integer references library.author (author_id) primary key,
  slug varchar(50),
  nb_books integer
);

create or replace function library_view.update_book_computed_data(
  book_id integer
) returns void
language sql
volatile
as $update_book_computed_data$
delete from
    library_view.book_computed_data
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
    library.book
    left join
    library.book_asset as book_cover
      on (book.book_id = book_cover.book_id and book_cover.type = 'cover')
    left join
    library.book_asset as book_epub
      on (book.book_id = book_epub.book_id and book_epub.type = 'epub')
    left join
    library.book_asset as book_mobi
      on (book.book_id = book_mobi.book_id and book_mobi.type = 'mobi')
  where
    book.book_id = $1
),
book_slug_data as (
  select
    substring(utils.slugify(book_title) for 50)::varchar as slug
  from
    book_with_assets_data
)
insert into library_view.book_computed_data
(book_id, slug, cover_path, epub_path, epub_size, mobi_path, mobi_size)
  select
    $1,
    (select slug from book_slug_data),
    book_cover_path,
    book_epub_path,
    book_epub_size,
    book_mobi_path,
    book_mobi_size
  from book_with_assets_data
;
$update_book_computed_data$;

create or replace function library_view.update_all_books_computed_data(
) returns bigint
language sql
volatile
as $update_all_books_computed_data$
select
  count(*)
from
  library.book join lateral (
    select library_view.update_book_computed_data(book_id)
  ) upd8 on true
;
$update_all_books_computed_data$;

/*
-- This materialized view is what powers our public API :-)
create materialized view library_view.book_with_related_data as
  select
    (case
     when book.gutenberg_id is not null then concat('g', book.gutenberg_id)::varchar
     else book.book_id::varchar
     end) as book_id,
    book.title as title,
    book.subtitle as subtitle,
    book.lang as lang,
    substring(utils.slugify(book.title) for 50)::varchar as slug,
    book.highlight as highlight,
    book_cover.path as cover,
    book_epub.path as epub,
    book_epub.size as epub_size,
    book_mobi.path as mobi,
    book_mobi.size as mobi_size,
    (case
     when author.gutenberg_id is not null then concat('g', author.gutenberg_id)::varchar
     else author.author_id::varchar
     end) as author_id,
    author.first_name as author_first_name,
    author.last_name as author_last_name,
    author.birth_year as author_birth_year,
    author.death_year as author_death_year,
    substring(utils.slugify(author.first_name || ' ' || author.last_name) for 50)::varchar as author_slug,
    (select count(*) from library.book as book2 where book2.author_id = author.author_id)::integer as author_nb_books,
    array_agg(genre.genre_id)::integer[] as genres_ids,
    array_agg(genre.title)::varchar[] as genres
  from
    library.book
    join
    library.author using (author_id)
    left join
    library.book_genre using (book_id)
    left join
    library.genre using (genre_id)
    left join
    library.book_asset as book_cover
      on (book.book_id = book_cover.book_id and book_cover.type = 'cover')
    left join
    library.book_asset as book_epub
      on (book.book_id = book_epub.book_id and book_epub.type = 'epub')
    left join
    library.book_asset as book_mobi
      on (book.book_id = book_mobi.book_id and book_mobi.type = 'mobi')
  group by
    book.book_id,
    author.author_id,
    book_cover.book_id, book_cover.type,
    book_epub.book_id, book_epub.type,
    book_mobi.book_id, book_mobi.type
;
create unique index on library_view.book_with_related_data
  (book_id);
create index on library_view.book_with_related_data
  (author_id);
create index on library_view.book_with_related_data
  (lang);
create index on library_view.book_with_related_data
  using gin(title exts.gin_trgm_ops);
create index on library_view.book_with_related_data
  using gin(author_first_name exts.gin_trgm_ops);
create index on library_view.book_with_related_data
  using gin(author_last_name exts.gin_trgm_ops);
create index on library_view.book_with_related_data
  using gin(genres);

-- This materialized view has only 4 fields,
-- but the "nb_book_per_lang" is quite expensive to compute.
create materialized view library_view.genre_with_related_data as (
  with
  lang as (
    select
      distinct(lang) as lang
    from
      library.book
  )
  select
    genre_id::integer,
    title::varchar,
    count(nb_books_by_lang.lang)::integer as nb_langs,
    sum(nb_books_by_lang.nb_books)::integer as nb_books,
    json_object(
      array_agg(nb_books_by_lang.lang),
      array_agg(nb_books_by_lang.nb_books::text)
    ) as nb_books_by_lang
  from
    library.genre
    left join lateral (
      select
        lang.lang,
        count(book.book_id)::integer
      from
        lang
        join library.book as book on lang.lang = book.lang
        join library.book_genre using (book_id)
      where
        library.book_genre.genre_id = genre.genre_id
      group by
        lang.lang
      order by
        lang.lang asc
    ) nb_books_by_lang(lang, nb_books) on true
  group by
    genre_id
);
create unique index on library_view.genre_with_related_data
  (genre_id);
create unique index on library_view.genre_with_related_data
  (title);

create materialized view library_view.book_additional_data as
  select
    (case
     when gutenberg_id is not null then concat('g', gutenberg_id)::varchar
     else book_id::varchar
     end) as book_id,
    intro
  from
    library.book_additional_data
    join library.book using (book_id)
;
create unique index on library_view.book_additional_data
  (book_id);
*/

commit;
