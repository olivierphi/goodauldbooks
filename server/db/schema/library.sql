begin;

drop schema if exists library cascade;
create schema library;

create schema if not exists exts;
create extension if not exists pg_trgm schema exts;

/**
 * Tables
 */

create table library.author (
  author_id serial primary key,
  gutenberg_id integer unique null,
  first_name text null,
  last_name text null
);

create table library.book (
  book_id serial primary key,
  gutenberg_id integer unique null,
  lang varchar(3) collate "C" not null,
  title text not null,
  subtitle text null,
  author_id int references library.author(author_id) not null
);
create index on library.book(author_id);

create table library.book_asset (
  book_id integer references library.book(book_id) not null,
  type varchar(10) collate "C" not null,
  path text collate "C" not null,
  size integer not null,
  primary key (book_id, type)
);

create table library.genre (
  genre_id serial primary key,
  title varchar(300) unique not null
);
create index on library.genre(title);

create table library.book_genre (
  book_id integer references library.book(book_id) not null,
  genre_id integer references library.genre(genre_id) not null,
  primary key (book_id, genre_id)
);

create table library.book_additional_data (
  book_id integer references library.book(book_id) not null primary key,
  intro text
);

/**
 * Views
 */

create materialized view library.book_with_related_data as
  select
    (case
      when book.gutenberg_id is not null then concat('g', book.gutenberg_id)
      else book.book_id::text
      end) as id,
     book.title as title,
     book.subtitle as subtitle,
     book.lang as lang,
     book_cover.path as cover,
     author.author_id::text as author_id,
     author.first_name as author_first_name,
     author.last_name as author_last_name,
     array_agg(genre.title) as genres
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
  group by
    book.book_id,
    author.author_id,
    book_cover.path
;
create unique index on library.book_with_related_data(id collate "C");
create index on library.book_with_related_data(author_id collate "C");
create index on library.book_with_related_data(lang collate "C");
create index on library.book_with_related_data using gin(title exts.gin_trgm_ops);
create index on library.book_with_related_data using gin(author_last_name exts.gin_trgm_ops);

commit;
