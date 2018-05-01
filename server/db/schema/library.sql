begin;

drop schema if exists library cascade;
create schema library;

/**
 * Tables
 */

create table library.author (
  author_id serial primary key,
  gutenberg_id integer unique null,
  first_name text null,
  last_name text null
  --   slug varchar(300) unique not null
);

create table library.book (
  book_id serial primary key,
  gutenberg_id integer unique null,
  lang varchar(3) not null,
  title text not null,
  subtitle text null,
  slug text unique not null,
  author_id int references library.author(author_id) not null
);
create index on library.book(author_id);

create table library.book_asset (
  book_id integer references library.book(book_id) not null,
  type varchar(10) not null,
  path text not null,
  size integer not null,
  primary key (book_id, type)
);

create table library.genre (
  genre_id serial primary key,
  title varchar(300) unique not null
);
create index on library.genre using hash(title);

create table library.book_genres (
  book_id integer references library.book(book_id) not null,
  genre_id integer references library.genre(genre_id) not null,
  primary key (book_id, genre_id)
);

commit;
