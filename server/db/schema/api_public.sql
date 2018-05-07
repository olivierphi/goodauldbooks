begin;

drop schema if exists api_public cascade;
create schema api_public;

/**
 * Functions composite types
 */

create type api_public.book_search_result as (
  book_id text,
  book_title text,
  book_subtitle text,
  book_cover_path text,
  book_lang varchar(3),
  author_id text,
  author_first_name text,
  author_last_name text,
  genres text[]
);

create type api_public.quick_autocompletion_result as (
  type text,
  book_id text,
  book_title text,
  book_lang varchar(3),
  author_id text,
  author_first_name text,
  author_last_name text
);

create type api_public.book_intro as (
  intro text
);

/**
 * Functions
 */

-- `curl -sS localhost:8085/rpc/search_books?pattern=frank | jq`
create or replace function api_public.search_books(
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
      cover,
      lang,
      author_id,
      author_first_name,
      author_last_name,
      genres
    )::api_public.book_search_result
  from
    library.book_with_related_data
  where
    title ilike concat('%', pattern, '%')
  limit 30
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
  with
  books_search as (
    select
        'book' as type,
        id as book_id,
        title as book_title,
        lang as book_lang,
        author_id,
        author_first_name,
        author_last_name
    from
      library.book_with_related_data
    where
      title ilike concat(pattern, '%')
    order by
      title asc
    limit 4
  ),
  authors_search as (
    select
        distinct
        'author' as type,
        null as book_id,
        null as book_title,
        null as book_lang,
        author_id,
        author_first_name,
        author_last_name
    from
      library.book_with_related_data
    where
      author_last_name ilike concat(pattern, '%')
    order by
      author_last_name asc
    limit 4
  )
  (
    select *
    from books_search
  )
  union all
  (
    select *
    from authors_search
  )
  ;
$function_quick_autocompletion$;

-- `curl -sS localhost:8085/rpc/featured_books | jq`
create or replace function api_public.featured_books(
) returns setof api_public.book_search_result
language sql
stable
as $function_featured_books$
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
      cover,
      lang,
      author_id,
      author_first_name,
      author_last_name,
      genres
    )::api_public.book_search_result
  from
    library.book_with_related_data
  where
    id in (select unnest(books_ids) from pinned_books_ids);
  ;
$function_featured_books$;

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
      cover,
      lang,
      author_id,
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

-- `curl -sS localhost:8085/rpc/get_book_intro?book_id=g345 | jq`
create or replace function api_public.get_book_intro(
  book_id text
) returns api_public.book_intro
language sql
stable
as $function_get_book_intro$
  -- first (very) naive version, to improve later :-)
  select
    intro
  from
    library.book_additional_data
  where
    book_id = utils.get_book_real_id($1)
  limit 1
  ;
$function_get_book_intro$;


\ir 'api_public_security_policies.sql'

commit;
