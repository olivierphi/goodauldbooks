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
  book_slug text,
  author_id text,
  author_first_name text,
  author_last_name text,
  author_slug text,
  genres text[]
);

create type api_public.book_full_genre as (
  title text,
  nb_books integer,
  -- This is a hash where keys are lang codes and values are number of books for this genre and this lang:
  nb_books_by_lang jsonb
);

create type api_public.book_full as (
  book_id text,
  book_title text,
  book_subtitle text,
  book_cover_path text,
  book_lang varchar(3),
  book_slug text,
  author_id text,
  author_first_name text,
  author_last_name text,
  author_slug text,
  genres api_public.book_full_genre[]
);

create type api_public.quick_autocompletion_result as (
  type text,
  book_id text,
  book_title text,
  book_lang varchar(3),
  book_slug text,
  author_id text,
  author_first_name text,
  author_last_name text,
  author_slug text,
  author_nb_books integer
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
      book_id,
      title,
      subtitle,
      cover,
      lang,
      slug,
      author_id,
      author_first_name,
      author_last_name,
      author_slug,
      genres
    )::api_public.book_search_result
  from
    library_view.book_with_related_data
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
      book_id,
      title as book_title,
      lang as book_lang,
      slug as book_slug,
      author_id,
      author_first_name,
      author_last_name,
      author_slug,
      author_nb_books
    from
      library_view.book_with_related_data
    where
      title ilike concat('%', pattern, '%')
    order by
      case
        when title ilike concat(pattern, '%') then 1
        else 0
      end desc,-- we give priority to books *starting* with the given pattern, and not only containing it
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
      null as book_slug,
      author_id,
      author_first_name,
      author_last_name,
      author_slug,
      author_nb_books
    from
      library_view.book_with_related_data
    where
      author_last_name ilike concat(pattern, '%')
    order by
      author_nb_books desc,
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
      book_id,
      title,
      subtitle,
      cover,
      lang,
      slug,
      author_id,
      author_first_name,
      author_last_name,
      author_slug,
      genres
    )::api_public.book_search_result
  from
    library_view.book_with_related_data,
    pinned_books_ids
  where
    book_id = any(pinned_books_ids.books_ids);
  ;
$function_featured_books$;

-- `curl -sS localhost:8085/rpc/get_book_by_id?book_id=g345 | jq`
create or replace function api_public.get_book_by_id(
  book_id text
) returns api_public.book_full
language sql
stable
as $function_get_book_by_id$
  -- first (very) naive version, to improve later :-)
  with
  book_genres as (
    select
      genres::text[] as genres
    from
      library_view.book_with_related_data
    where
      book_id = $1
  ),
  book_detailed_genres as (
    select
      (
        title,
        nb_books,
        nb_books_by_lang
      )::api_public.book_full_genre as full_genre
    from
      library_view.genre_with_related_data
    where
      title = any ((select genres from book_genres)::text[])
  ),
  book_detailed_genres_array as (
    select
      array_agg(full_genre)::api_public.book_full_genre[] as full_genres
    from
      book_detailed_genres
  )
  select
    (
      book_id,
      book_with_related_data.title,
      subtitle,
      cover,
      lang,
      slug,
      author_id,
      author_first_name,
      author_last_name,
      author_slug,
      full_genres
    )::api_public.book_full
  from
    library_view.book_with_related_data,
    book_detailed_genres_array
  where
    book_id = $1
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


\ir 'api_public.security_policies.sql'

commit;
