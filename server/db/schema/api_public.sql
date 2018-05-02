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
) returns setof api_public.book_search_result
language sql
stable
as $function_search_book$
  -- We'll do something crazy with fuzzy text search properly indexed instead of that quick-n-dirty "ilike" of course,
  -- but that will be enough for a first test :-)
  select
    (
      id,
      title,
      subtitle,
      lang,
      author_first_name,
      author_last_name,
      genres
    )::api_public.book_search_result
  from
    library.book_with_related_data
  where
    title ilike concat('%', pattern, '%')
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
      id,
      title,
      lang,
      author_first_name,
      author_last_name
    )::api_public.quick_autocompletion_result
  from
    library.book_with_related_data
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
  with
  pinned_books_ids as (
    select
      value::text[] as books_ids
    from
      webapp.settings
    where
      name = 'pinned_books_ids'
  )
  select
    (
      id,
      title,
      subtitle,
      lang,
      author_first_name,
      author_last_name,
      genres
    )::api_public.book_search_result
  from
    library.book_with_related_data
  where
    id in (select unnest(books_ids) from pinned_books_ids);
  ;
$function_pinned_books$;

-- `curl -sS localhost:8085/rpc/get_book_by_id?book_id=g345 | jq`
create or replace function api_public.get_book_by_id(
  book_id text
) returns api_public.book_search_result
language sql
stable
as $function_get_book_by_id$
  -- first (very) naive version, to improve later :-)
  select
    (
      id,
      title,
      subtitle,
      lang,
      author_first_name,
      author_last_name,
      genres
    )::api_public.book_search_result
  from
    library.book_with_related_data
  where
    id = book_id
  limit 1
  ;
$function_get_book_by_id$;

/**
 * Postgrest users configuration
 * @link https://postgrest.com/en/v4.4/auth.html
 */
do
$do_revoke$
begin
  if (
   select
     count(*)
    from
      pg_catalog.pg_roles
    where
      rolname in ('api_public_authenticator', 'api_public_anon')
  ) > 1 then
    revoke usage on schema
      api_public, library, utils, webapp
    from
      api_public_authenticator, api_public_anon
    cascade;

    revoke all privileges on all tables in schema
      api_public, library, webapp
    from
      api_public_authenticator, api_public_anon
    cascade;

    revoke all privileges on all functions in schema
      api_public, library, utils, webapp
    from
      api_public_authenticator, api_public_anon
    cascade;
  end if;
end;
$do_revoke$;

drop role if exists api_public_authenticator;
drop role if exists api_public_anon;

create role api_public_anon nologin;

create role api_public_authenticator noinherit login password 'devpassword'; -- change that hard-coded password later of course ^_^
grant api_public_anon to api_public_authenticator;

-- "Anonymous" role permissions. We have to be very careful with that! :-)
grant usage on schema
  api_public, library, utils, webapp
to
  api_public_anon;
grant select on table
  library.book, library.author,
  library.book_genres, library.genre,
  library.book_with_related_data,
  webapp.settings
to
  api_public_anon;

grant execute on function
  api_public.search_book(pattern text),
  api_public.quick_autocompletion(pattern text),
  api_public.pinned_books(),
  api_public.get_book_by_id(id text)
to
  api_public_anon;

commit;
