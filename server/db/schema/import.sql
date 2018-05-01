begin;

drop schema if exists import cascade;
create schema import;

/**
 * I would have liked to prefix all this "Project Gutenberg" stuff with "pg_", but it's generally
 * not a good idea to do so in a PosgreSQL context, which already uses this very same prefix for its own internal stuff :-)
 * This is why I ended up choosing the longer "gutenberg_" prefix.
 */


/**
 * Tables
 */

create table import.gutenberg_raw_rdf_files (
  gutenberg_id integer unique not null primary key,
  rdf_content xml not null,
  assets jsonb not null,
  imported_at timestamp not null default now()
);

create table import.gutenberg_author (
  author_id serial primary key,
  gutenberg_id integer unique null,
  first_name text null,
  last_name text null
  --   slug varchar(300) unique not null
);

create table import.gutenberg_book (
  book_id serial primary key,
  gutenberg_id integer unique null,
  lang varchar(3) not null,
  title text not null,
  subtitle text null,
  slug text unique not null,
  author_id int references import.gutenberg_author(author_id) not null
);
create index on import.gutenberg_book(author_id);

create table import.gutenberg_book_asset (
  book_id integer references import.gutenberg_book(book_id) not null,
  type varchar(10) not null,
  path text not null,
  size integer not null,
  primary key (book_id, type)
);

create table import.gutenberg_genre (
  genre_id serial primary key,
  title varchar(300) unique not null
);
create index on import.gutenberg_genre using hash(title);

create table import.gutenberg_book_genres (
  book_id integer references import.gutenberg_book(book_id) not null,
  genre_id integer references import.gutenberg_genre(genre_id) not null,
  primary key (book_id, genre_id)
);

/**
 * Functions
 */

create type import.gutenberg_imported_author as (
  gutenberg_id integer,
  full_name text,
  first_name text,
  last_name text,
  alias varchar(100),
  birth_year integer,
  death_year integer
);

create type import.gutenberg_imported_book as (
  gutenberg_id integer,
  lang varchar(3),
  title text,
  subtitle text,
  slug text,
  genres text[],
  author import.gutenberg_imported_author
);

create type import.gutenberg_book_import_result as (
  book_id integer,
  author_id integer,
  genre_ids integer[]
);

create or replace function import.gutenberg_get_book_from_rdf(
  rdf_data xml
) returns import.gutenberg_imported_book
language sql
immutable
as $function_get_book_from_rdf$
  with
  xml_namespaces as (
    select array[
      array['rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'],
      array['dcterms', 'http://purl.org/dc/terms/'],
      array['pgterms', 'http://www.gutenberg.org/2009/pgterms/']
    ] as xmlns
  ),
  rdf_raw_parsing as (
    select
    -- book data
    regexp_replace( trim( unnest( xpath(
      '/rdf:RDF/pgterms:ebook/@rdf:about',
      rdf_data,
      xmlns
    ) )::text ), '^ebooks/(\d+)$', '\1' )
    as book_id,

    trim( unnest( xpath(
      '//dcterms:language/rdf:Description/rdf:value/text()',
      rdf_data,
      xmlns
    ) )::text )
    as book_lang,

    trim( unnest( xpath(
      '//dcterms:title/text()',
      rdf_data,
      xmlns
    ) )::text )
    as book_title,

    xpath(
      '//dcterms:subject/rdf:Description/rdf:value/text()',
      rdf_data,
      xmlns
    )::text[]
    as book_genres,

    -- author data
    regexp_replace( trim( unnest( xpath(
      '//dcterms:creator/pgterms:agent/@rdf:about',
      rdf_data,
      xmlns
    ) )::text ), '^\d+/agents/(\d+)$', '\1' )
    as author_id,

    trim( unnest( xpath(
      '//dcterms:creator/pgterms:agent/pgterms:name/text()',
      rdf_data,
      xmlns
    ) )::text )
    as author_name,

    trim( unnest( xpath(
      '//dcterms:creator/pgterms:agent/pgterms:alias/text()',
      rdf_data,
      xmlns
    ) )::text )
    as author_alias,

    trim( unnest( xpath(
      '//dcterms:creator/pgterms:agent/pgterms:birthdate/text()',
      rdf_data,
      xmlns
    ) )::text )
    as author_birth_year,

    trim( unnest( xpath(
      '//dcterms:creator/pgterms:agent/pgterms:deathdate/text()',
      rdf_data,
      xmlns
    ) )::text )
    as author_death_year
    from
      xml_namespaces
  ),
  sanitisation as (
    select
      regexp_replace(book_title, '&#x0d;\W+', ' ', 'g') as sanitised_title
    from
      rdf_raw_parsing
  ),
  regexp_parsing as (
    select
      regexp_split_to_array(author_name, '\s*,\s*') as author_name_array,
      regexp_split_to_array(sanitised_title, e'\\n+|\\s*;\\s*') as title_array
    from
      rdf_raw_parsing,
      sanitisation
  )
  select
    (
      -- book fields (see the definition of the "import.gutenberg_imported_book" composite type)
      book_id::integer,
      book_lang,
      title_array[1],
      title_array[2],
      utils.slugify(format('%s-%s-%s', book_lang, book_title, author_name)),
      book_genres,
      (
        -- author fields (see the definition of the "import.gutenberg_imported_author" composite type)
        author_id::integer,
        author_name,
        trim( author_name_array[2] ),
        trim( author_name_array[1] ),
        author_alias,
        author_birth_year::integer,
        author_death_year::integer
      )::import.gutenberg_imported_author
    )::import.gutenberg_imported_book
  from
    rdf_raw_parsing,
    sanitisation,
    regexp_parsing
  ;
$function_get_book_from_rdf$;


create or replace function import.gutenberg_create_book(
  imported_book import.gutenberg_imported_book
) returns import.gutenberg_book_import_result
language plpgsql
as $function_create_book$
  declare
    imported_author import.gutenberg_imported_author;
    returned_author_id import.gutenberg_author.author_id%type;
    returned_book_id import.gutenberg_book.book_id%type;
    genre_title import.gutenberg_genre.title%type;
    created_genre_id import.gutenberg_genre.genre_id%type;
    returned_genres_ids integer[] = array[]::integer[];
  begin
    imported_author = imported_book.author;

    -- only create the author if it doesn't exists already:
    select author_id into returned_author_id from import.gutenberg_author where gutenberg_id = imported_author.gutenberg_id;
    if returned_author_id is null then
      insert into import.gutenberg_author(gutenberg_id, first_name, last_name)
        values (imported_author.gutenberg_id, imported_author.first_name, imported_author.last_name)
      returning author_id into returned_author_id;
    end if;

    -- ditto: only create the book if it doesn't exists already:
    select book_id into returned_book_id from import.gutenberg_book where gutenberg_id = imported_book.gutenberg_id;
    if returned_book_id is null then
      insert into import.gutenberg_book (gutenberg_id, lang, title, subtitle, slug, author_id)
        values (imported_book.gutenberg_id, imported_book.lang, imported_book.title, imported_book.subtitle, imported_book.slug, returned_author_id)
      returning book_id into returned_book_id;
    end if;

    -- create genres:
    foreach genre_title in array imported_book.genres
    loop
      select genre_id into created_genre_id from import.gutenberg_genre where title = genre_title;
      if created_genre_id is null then
        insert into import.gutenberg_genre (title)
          values (genre_title) on conflict do nothing
        returning genre_id into created_genre_id;
      end if;
      select array_append(returned_genres_ids, created_genre_id) into returned_genres_ids;
    end loop;

    -- create relations with those genres:
    foreach created_genre_id in array returned_genres_ids
    loop
      insert into import.gutenberg_book_genres (book_id, genre_id)
        values (returned_book_id, created_genre_id) on conflict do nothing;
    end loop;

    return (returned_book_id, returned_author_id, returned_genres_ids)::import.gutenberg_book_import_result;
  end;
$function_create_book$;


create or replace function import.create_books_from_raw_rdfs(
  wipe_previsous_books bool
) returns integer
language plpgsql
volatile
as $function_create_books_from_raw_rdfs$
declare
  nb_books_created integer = 0;
  current_raw_book_data record;
  current_created_book import.gutenberg_book_import_result;
  current_raw_book_asset_data record;
  current_book_nb_assets_created integer;
  imported_book_data import.gutenberg_imported_book;
begin
  if wipe_previsous_books then
    truncate import.gutenberg_book, import.gutenberg_author, import.gutenberg_genre, import.gutenberg_book_genres, import.gutenberg_book_asset;
  end if;

  for current_raw_book_data in
  select
    gutenberg_id,
    rdf_content,
    assets
  from
    import.gutenberg_raw_rdf_files
  where
    -- We only import books matching the following criteria:
    -- 1) it must have a epub file
    assets ? 'epub'
    -- 2) it must not be a periodical (category "AP")
    and rdf_content::text not like '%<rdf:value>AP</rdf:value>%'
  loop
    -- A) Create books, theirs authors and their literary genres
    imported_book_data = import.gutenberg_get_book_from_rdf(current_raw_book_data.rdf_content);
    select * into current_created_book from import.gutenberg_create_book(imported_book_data);

    -- B) Create the books assets
    current_book_nb_assets_created = 0;
    for current_raw_book_asset_data in select * from jsonb_each(current_raw_book_data.assets)
    loop
      insert into import.gutenberg_book_asset (book_id, type, path, size)
      values (current_created_book.book_id, current_raw_book_asset_data.key, current_raw_book_asset_data.value->>'path', (current_raw_book_asset_data.value->>'size')::integer);
      current_book_nb_assets_created = current_book_nb_assets_created + 1;
    end loop;

    nb_books_created = nb_books_created + 1;
    raise notice 'book % title: % (% assets)', current_raw_book_data.gutenberg_id, imported_book_data.title, current_book_nb_assets_created;


  end loop;



  return nb_books_created;
end;
$function_create_books_from_raw_rdfs$;

commit
