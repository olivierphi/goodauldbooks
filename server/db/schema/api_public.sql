begin;

drop schema if exists api_public cascade;
create schema api_public;

/**
 * Composite types
 */

create type api_public.book_search_record as (
  book_title text,
  book_subtitle text,
  lang varchar(3),
  author_first_name text,
  author_last_name text
);

/**
 * Functions
 */

-- `curl -sS localhost:8085/rpc/search_book?pattern=frank | jq`
create or replace function api_public.search_book(
  pattern text
) returns setof api_public.book_search_record
language sql
stable
as $function_search_book$
  -- We'll do something crazy with fuzzy text search properly indexed instead of that quick-n-dirty "ilike" of course,
  -- but that will be enough for a first test :-)
  select
    (
      book.title,
      book.subtitle,
      book.lang,
      author.first_name,
      author.last_name
    )::api_public.book_search_record
  from
    library.book
    join
      library.author using (author_id)
  where
    title ilike concat('%', pattern, '%')
  ;
$function_search_book$;

/**
 * Postgrest users configuration
 * @link https://postgrest.com/en/v4.4/auth.html
 */
revoke usage on schema
  api_public, library
from
  api_public_authenticator, api_public_anon
cascade;
revoke all privileges on all tables in schema
  api_public, library
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
  api_public, library
to
  api_public_anon;
grant select on table
  library.book, library.author
to
  api_public_anon;

grant execute on function
  api_public.search_book(text)
to
  api_public_anon;

commit;
