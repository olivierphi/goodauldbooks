begin;

drop schema if exists library cascade;
create schema library;

/**
 * Tables
 */

create table library.author (
  author_id serial primary key,
  gutenberg_id integer unique null,
  first_name varchar null,
  last_name varchar null,
  birth_year integer null,
  death_year integer null
);
-- (Django "__istartswith" will match with UPPER(), so our GIN indexes have to use upper-cased values accordingly)
create index on library.author
  using gin(upper(first_name) exts.gin_trgm_ops);
create index on library.author
  using gin(upper(last_name) exts.gin_trgm_ops);

create table library.book (
  book_id serial primary key,
  gutenberg_id integer unique null,
  lang varchar(3) collate "C" not null,
  title varchar not null,
  subtitle varchar null,
  highlight integer not null default 0,
  author_id int references library.author(author_id) not null
);
create index on library.book(author_id);
create index on library.book
  using gin(upper(title) exts.gin_trgm_ops);

create table library.book_asset (
  book_id integer references library.book(book_id) not null,
  type varchar(10) collate "C" not null,
  path varchar collate "C" not null,
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

commit;
