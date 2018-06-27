begin;

drop schema if exists api_public cascade;
create schema api_public;

/**
 * Functions composite types
 */

create type api_public.pagination_info as (
  page integer,
  nb_per_page integer,
  nb_results_total integer
);

create type api_public.book_light as (
  book_id varchar,
  book_title varchar,
  book_subtitle varchar,
  book_cover_path varchar,
  book_lang varchar(3),
  book_slug varchar,
  author_id varchar,
  author_first_name varchar,
  author_last_name varchar,
  author_slug varchar,
  author_nb_books integer,
  genres varchar[]
);

create type api_public.book_full as (
  book_id varchar,
  book_title varchar,
  book_subtitle varchar,
  book_cover_path varchar,
  book_epub_size integer,
  book_mobi_size integer,
  book_lang varchar(3),
  book_slug varchar,
  author_id varchar,
  author_first_name varchar,
  author_last_name varchar,
  author_birth_year integer,
  author_death_year integer,
  author_slug varchar,
  author_nb_books integer,
  genres varchar[]
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
  type varchar,
  book_id varchar,
  book_title varchar,
  book_lang varchar(3),
  book_slug varchar,
  author_id varchar,
  author_first_name varchar,
  author_last_name varchar,
  author_slug varchar,
  author_nb_books integer,
  highlight integer
);

create type api_public.book_intro as (
  intro text
);

create type api_public.books_by_genre_with_pagination as (
  books api_public.book_light[],
  pagination api_public.pagination_info
);

create type api_public.books_by_author_with_pagination as (
  books api_public.book_light[],
  pagination api_public.pagination_info
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
      author_nb_books,
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
  pattern text,
  lang varchar(3) = 'all'
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
      author_nb_books,
      highlight
    from
      library_view.book_with_related_data
    where
      title ilike concat('%', pattern, '%') and
      case
        when $2 = 'all' then true
        else lang = $2
      end
    order by
      case
        when title ilike concat(pattern, '%') then 1
        else 0
      end desc,-- we give priority to books *starting* with the given pattern, and not only containing it
      highlight desc,
      title asc
    limit 4
  ),
  authors_search as (
    select
      'author' as type,
      null as book_id,
      null as book_title,
      null as book_lang,
      null as book_slug,
      author_id,
      author_first_name,
      author_last_name,
      author_slug,
      author_nb_books,
      highlight
    from
      library_view.book_with_related_data
    where
      author_last_name ilike concat(pattern, '%') or
      author_first_name ilike concat(pattern, '%')
    order by
      highlight desc,
      author_nb_books desc,
      author_last_name asc
    limit 8
  )
  (
    select
      *
    from
      books_search
  )
  union all
  (
    select
      author.*
    from
      (
        select
          distinct on (author_id)
          *
        from
          authors_search
        limit
          4
      ) as author
    order by
      highlight desc,
      author_nb_books desc,
      author_last_name asc
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
      author_nb_books,
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
      genres::varchar[] as genres
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
      title = any ((select genres from book_genres)::varchar[])
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
        author_nb_books,
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
    library_view.book_additional_data
  where
    book_id = $1
  limit 1
  ;
$function_get_book_intro$;

-- `curl -sS localhost:8085/rpc/get_books_by_genre?genre=Vampires%20--%20Fiction | jq`
create or replace function api_public.get_books_by_genre(
  genre varchar,
  lang varchar(3) = 'all',
  page integer = 1,
  nb_per_page integer = 10
) returns api_public.books_by_genre_with_pagination
language sql
stable
as $function_get_books_by_genre$
  with
  pagination as (
    select
      (page - 1) * nb_per_page as p_offset,
      min(nb)::integer as p_nb
    from
      -- we hard-code a max number of results, just in case:
      unnest(array[nb_per_page, 30]) t(nb)
  ),
  nb_results_total as (
    select
      count(book_id) as count
    from
      library_view.book_with_related_data
    where
      genres && array[genre] and
      case
        when $2 = 'all' then true
        else lang = $2
      end
  ),
  results as (
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
        author_nb_books,
        genres
      )::api_public.book_light as book
    from
      library_view.book_with_related_data
    where
      genres && array[genre] and
      case
        when $2 = 'all' then true
        else lang = $2
      end
    order by
      title asc, subtitle asc
    limit
      (select p_nb from pagination)::integer
    offset
      (select p_offset from pagination)::integer
  )
  select
    (
      array_agg(book)::api_public.book_light[],
      (
        page,
        nb_per_page,
        (select count from nb_results_total)::integer
      )::api_public.pagination_info
    )::api_public.books_by_genre_with_pagination
  from
    results
$function_get_books_by_genre$;

-- `curl -sS localhost:8085/rpc/get_books_by_author?author_id=g61 | jq`
create or replace function api_public.get_books_by_author(
  author_id varchar,
  lang varchar(3) = 'all',
  page integer = 1,
  nb_per_page integer = 10
) returns api_public.books_by_author_with_pagination
language sql
stable
as $function_get_books_by_author$
with
  pagination as (
    select
      (page - 1) * nb_per_page as p_offset,
      min(nb)::integer as p_nb
    from
      -- we hard-code a max number of results, just in case:
      unnest(array[nb_per_page, 30]) t(nb)
  ),
  nb_results_total as (
    select
      count(book_id) as count
    from
      library_view.book_with_related_data
    where
      author_id = $1 and
      case
        when $2 = 'all' then true
        else lang = $2
      end
  ),
  results as (
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
        author_nb_books,
        genres
      )::api_public.book_light as book
    from
      library_view.book_with_related_data
    where
      author_id = $1 and
      case
        when $2 = 'all' then true
        else lang = $2
      end
    order by
      title asc, subtitle asc
     limit
      (select p_nb from pagination)::integer
    offset
      (select p_offset from pagination)::integer
  )
  select
    (
      array_agg(book)::api_public.book_light[],
      (
        page,
        nb_per_page,
        (select count from nb_results_total)::integer
      )::api_public.pagination_info
    )::api_public.books_by_author_with_pagination
  from
    results
$function_get_books_by_author$;

\ir 'api_public.security_policies.sql'

commit;
