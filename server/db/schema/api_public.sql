begin;

drop schema if exists api_public cascade;
create schema api_public;

/**
 * Functions composite types
 */

create type api_public.book_light as (
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

create type api_public.book_full as (
  book_id text,
  book_title text,
  book_subtitle text,
  book_cover_path text,
  book_epub_size integer,
  book_mobi_size integer,
  book_lang varchar(3),
  book_slug text,
  author_id text,
  author_first_name text,
  author_last_name text,
  author_birth_year integer,
  author_death_year integer,
  author_slug text,
  genres text[]
);

create type api_public.genre_with_stats as (
  title text,
  nb_books integer,
  -- This is a hash where keys are lang codes and values are number of books for this genre and this lang:
  nb_books_by_lang jsonb
);

create type api_public.book_full_with_genre_stats as (
  book api_public.book_full,
  genres api_public.genre_with_stats[]
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
) returns setof api_public.book_light
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
    )::api_public.book_light
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
) returns setof api_public.book_light
language sql
stable
as $function_featured_books$
  with
  featured_books_ids as (
    select
      value::text[] as books_ids
    from
      webapp.settings
    where
      name = 'featured_books_ids'
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
    )::api_public.book_light
  from
    library_view.book_with_related_data
  where
    book_id = any((select books_ids from featured_books_ids)::text[]);
  ;
$function_featured_books$;

-- `curl -sS localhost:8085/rpc/get_book_by_id?book_id=g345 | jq`
create or replace function api_public.get_book_by_id(
  book_id text
) returns api_public.book_full_with_genre_stats
language sql
stable
as $function_get_book_by_id$
  with
  book_genres as (
    select
      genres::text[] as genres
    from
      library_view.book_with_related_data
    where
      book_id = $1
  ),
  book_genres_with_stats as (
    select
      (
        title,
        nb_books,
        nb_books_by_lang
      )::api_public.genre_with_stats as genre
    from
      library_view.genre_with_related_data
    where
      title = any ((select genres from book_genres)::text[])
    order by
      nb_books desc
  )
  select
    (
      (
        book_id,
        book_with_related_data.title,
        subtitle,
        cover,
        epub_size,
        mobi_size,
        lang,
        slug,
        author_id,
        author_first_name,
        author_last_name,
        author_birth_year,
        author_death_year,
        author_slug,
        genres
      )::api_public.book_full,
      (
        select array_agg(genre) from book_genres_with_stats
      )::api_public.genre_with_stats[]
    )::api_public.book_full_with_genre_stats
  from
    library_view.book_with_related_data
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

-- `curl -sS localhost:8085/rpc/get_books_by_genre?genre=Vampires%20--%20Fiction | jq`
create or replace function api_public.get_books_by_genre(
  genre text,
  nb_results integer = 10
) returns setof api_public.book_light
language sql
stable
as $function_get_books_by_genre$
  with
  pagination as (
    select
      min(nb)::integer as nb_results
    from
      -- we hard-code a max number of results, just in case:
      unnest(array[nb_results, 30]) t(nb)
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
    )::api_public.book_light
  from
    library_view.book_with_related_data
  where
    genres && array[genre]
  order by
    title asc
  limit
    (select nb_results from pagination)::integer
$function_get_books_by_genre$;

\ir 'api_public.security_policies.sql'

commit;
