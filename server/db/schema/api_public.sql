begin;

drop schema if exists api_public cascade;
create schema api_public;

/**
 * Composite types
 */

create type api_public.book_search_result as (
  book_id text,
  book_title text,
  book_subtitle text,
  lang varchar(3),
  author_first_name text,
  author_last_name text,
  genres text[]
);

create type api_public.quick_autocompletion_result as (
  book_id text,
  book_title text,
  author_name text,
  lang varchar(3),
  url text
);

/**
 * Functions
 */

-- `curl -sS localhost:8085/rpc/search_book?pattern=frank | jq`
create or replace function api_public.search_book(
  pattern text
) returns setof api_public.book_search_result
language sql
stable
as $function_search_book$
  -- We'll do something crazy with fuzzy text search properly indexed instead of that quick-n-dirty "ilike" of course,
  -- but that will be enough for a first test :-)
  select
    (
      book.slug, -- todo: choose a books ids strategy
      book.title,
      book.subtitle,
      book.lang,
      author.first_name,
      author.last_name,
      array_agg(genre.title)
    )::api_public.book_search_result
  from
    library.book
    join
      library.author using (author_id)
    left join
      library.book_genres using (book_id)
    left join
      library.genre using (genre_id)
  where
    book.title ilike concat('%', pattern, '%')
  group by
    book.book_id,
    author.author_id
  ;
$function_search_book$;

-- `curl -sS localhost:8085/rpc/quick_autocompletion?pattern=frank | jq`
create or replace function api_public.quick_autocompletion(
  pattern text
) returns setof api_public.quick_autocompletion_result
language sql
stable
as $function_quick_autocompletion$
  -- first (very) naive version, to improve later :-)
  select
    (
      book.slug, -- todo: choose a books ids strategy
      book.title,
      utils.author_name(author.first_name, author.last_name),
      book.lang,
      book.slug -- todo: build a real URLs strategy
    )::api_public.quick_autocompletion_result
  from
    library.book
    join
      library.author using (author_id)
  where
    title ilike concat(pattern, '%')
  ;
$function_quick_autocompletion$;

-- `curl -sS localhost:8085/rpc/pinned_books | jq`
create or replace function api_public.pinned_books(
) returns setof api_public.book_search_result
language sql
stable
as $function_pinned_books$
  -- first (very) naive version, to improve later :-)
  select
    (
      book.slug, -- todo: choose a books ids strategy
      book.title,
      book.subtitle,
      book.lang,
      author.first_name,
      author.last_name,
      array_agg(genre.title)
    )::api_public.book_search_result
  from
    library.book
    join
    library.author using (author_id)
    left join
    library.book_genres using (book_id)
    left join
    library.genre using (genre_id)
  where
    book.gutenberg_id in (345, 84, 174)
  group by
    book.book_id,
    author.author_id
  ;
$function_pinned_books$;

-- `curl -sS localhost:8085/rpc/get_book_by_id?id=en-stickeen-muir-john | jq`
create or replace function api_public.get_book_by_id(
  id text
) returns setof api_public.book_search_result
language sql
stable
as $function_get_book_by_id$
  -- first (very) naive version, to improve later :-)
  select
    (
      book.slug, -- todo: choose a books ids strategy
      book.title,
      book.subtitle,
      book.lang,
      author.first_name,
      author.last_name,
      array_agg(genre.title)
    )::api_public.book_search_result
  from
    library.book
    join
    library.author using (author_id)
    left join
    library.book_genres using (book_id)
    left join
    library.genre using (genre_id)
  where
    book.slug = id
  group by
    book.book_id,
    author.author_id
  ;
$function_get_book_by_id$;

/**
 * Postgrest users configuration
 * @link https://postgrest.com/en/v4.4/auth.html
 */
revoke usage on schema
  api_public, library, utils
from
  api_public_authenticator, api_public_anon
cascade;
revoke all privileges on all tables in schema
  api_public, library
from
  api_public_authenticator, api_public_anon
cascade;
revoke all privileges on all functions in schema
  api_public, library, utils
from
  api_public_authenticator, api_public_anon
cascade;

drop role if exists api_public_authenticator;
drop role if exists api_public_anon;

create role api_public_anon nologin;

create role api_public_authenticator noinherit password 'devpassword' login; -- change that hard-coded password later of course ^_^
grant api_public_anon to api_public_authenticator;

-- "Anonymous" role permissions. We have to be very careful with that! :-)
grant usage on schema
  api_public, library, utils
to
  api_public_anon;
grant select on table
  library.book, library.author,
  library.book_genres, library.genre
to
  api_public_anon;

grant execute on function
  api_public.search_book(pattern text),
  api_public.quick_autocompletion(pattern text),
  api_public.pinned_books(),
  api_public.get_book_by_id(id text),
  utils.author_name
to
  api_public_anon;

commit;
