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

commit;
