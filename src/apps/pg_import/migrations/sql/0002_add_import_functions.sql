/**
 * "Utils" functions
 */

create or replace function utils_array_remove_nulls(
  arr text []
)
  returns text []
strict
immutable
language sql
as $function_array_remove_nulls$
select array_agg(value)
  filter (where value is not null)
from
      unnest(arr) t(value);
$function_array_remove_nulls$;

/**
 * Import functions composite types
 */

create type import_gutenberg_imported_author as (
  gutenberg_id integer,
  full_name    text,
  first_name   text,
  last_name    text,
  alias        varchar(100),
  birth_year   integer,
  death_year   integer
);

create type import_gutenberg_imported_book_additional_data as (
  intro text
);

create type import_gutenberg_imported_book as (
  gutenberg_id integer,
  lang         varchar(3),
  title        text,
  subtitle     text,
  size         integer,
  genres       text [],
  author       import_gutenberg_imported_author
);

create type import_book_import_result as (
  book_id   integer,
  author_id integer,
  genre_ids integer []
);


/**
 * Import functions
 */

create or replace function import_gutenberg_get_book_from_rdf(
  rdf_data xml
)
  returns import_gutenberg_imported_book
language sql
immutable
as $function_get_book_from_rdf$
with
    xml_namespaces as (
    select array [
           array ['rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'],
           array ['dcterms', 'http://purl.org/dc/terms/'],
           array ['pgterms', 'http://www.gutenberg.org/2009/pgterms/']
           ] as xmlns
  ),
    rdf_raw_parsing as (
    select
      -- book data
      regexp_replace(
        trim(unnest(xpath(
                      '/rdf:RDF/pgterms:ebook/@rdf:about',
                      rdf_data,
                      xmlns
                    )) :: text),
        '^ebooks/(\d+)$', '\1')
        as book_id,

      trim(unnest(xpath(
                    '//dcterms:language/rdf:Description/rdf:value/text()',
                    rdf_data,
                    xmlns
                  )) :: text)
        as book_lang,

      trim(unnest(xpath(
                    '//dcterms:title/text()',
                    rdf_data,
                    xmlns
                  )) :: text)
        as book_title,

      trim(unnest(xpath(
                    '//pgterms:file[contains(@rdf:about, ''.epub.noimages'')]/dcterms:extent/text()',
                    rdf_data,
                    xmlns
                  )) :: text)
        as book_size,

      utils_array_remove_nulls(
        xpath(
          '//dcterms:subject/rdf:Description/rdf:value/text()',
          rdf_data,
          xmlns
        ) :: text []
      )
        as book_genre,

      -- author data
      regexp_replace(
        trim(unnest(xpath(
                      '//dcterms:creator/pgterms:agent/@rdf:about',
                      rdf_data,
                      xmlns
                    )) :: text),
        '^\d+/agents/(\d+)$', '\1')
        as author_id,

      trim(unnest(xpath(
                    '//dcterms:creator/pgterms:agent/pgterms:name/text()',
                    rdf_data,
                    xmlns
                  )) :: text)
        as author_name,

      trim(unnest(xpath(
                    '//dcterms:creator/pgterms:agent/pgterms:alias/text()',
                    rdf_data,
                    xmlns
                  )) :: text)
        as author_alias,

      trim(unnest(xpath(
                    '//dcterms:creator/pgterms:agent/pgterms:birthdate/text()',
                    rdf_data,
                    xmlns
                  )) :: text)
        as author_birth_year,

      trim(unnest(xpath(
                    '//dcterms:creator/pgterms:agent/pgterms:deathdate/text()',
                    rdf_data,
                    xmlns
                  )) :: text)
        as author_death_year
    from
      xml_namespaces
  ),
    sanitisation as (
    select regexp_replace(book_title, '&#x0d;\W+', ' ', 'g') as sanitised_title
    from
      rdf_raw_parsing
  ),
    regexp_parsing as (
    select
      regexp_split_to_array(author_name, '\s*,\s*')             as author_name_array,
      regexp_split_to_array(sanitised_title, e'\\n+|\\s*;\\s*') as title_array
    from
      rdf_raw_parsing,
      sanitisation
  )
select (
  -- book fields (see the definition of the "import_gutenberg_imported_book" composite type)
  book_id :: integer,
  book_lang,
  title_array [1],
  title_array [2],
  book_size :: integer,
  book_genre,
  (
    -- author fields (see the definition of the "import_gutenberg_imported_author" composite type)
    author_id :: integer,
    author_name,
    trim(author_name_array [2]),
    trim(author_name_array [1]),
    author_alias,
    author_birth_year :: integer,
    author_death_year :: integer
  ) :: import_gutenberg_imported_author
) :: import_gutenberg_imported_book
from
  rdf_raw_parsing,
  sanitisation,
  regexp_parsing;
$function_get_book_from_rdf$;


create or replace function import_gutenberg_create_book(
  imported_book import_gutenberg_imported_book
)
  returns import_book_import_result
language plpgsql
as $function_create_book$
declare
  imported_author     import_gutenberg_imported_author;
  returned_author_id  library_author.author_id%type;
  returned_book_id    library_book.book_id%type;
  genre_title         library_genre.title%type;
  created_genre_id    library_genre.genre_id%type;
  returned_genres_ids integer [] = array [] :: integer [];
begin
  imported_author = imported_book.author;

  -- only create the author if it doesn't exists already:
  select author_id
  into returned_author_id
  from library_author
  where gutenberg_id = imported_author.gutenberg_id;
  if returned_author_id is null
  then
    insert into library_author (gutenberg_id, first_name, last_name, birth_year, death_year)
    values
      (imported_author.gutenberg_id, imported_author.first_name, imported_author.last_name, imported_author.birth_year,
       imported_author.death_year)
    returning author_id
      into returned_author_id;
  end if;

  -- ditto: only create the book if it doesn't exists already:
  select book_id
  into returned_book_id
  from library_book
  where gutenberg_id = imported_book.gutenberg_id;
  if returned_book_id is null
  then
    insert into library_book (gutenberg_id, lang, title, subtitle, size, author_id, highlight)
    values
      (imported_book.gutenberg_id, imported_book.lang, imported_book.title, imported_book.subtitle, imported_book.size,
       returned_author_id, 0)
    returning book_id
      into returned_book_id;
  end if;

  -- create genres:
  if imported_book.genres is not null
  then
    foreach genre_title in array imported_book.genres
    loop
      select genre_id
      into created_genre_id
      from library_genre
      where title = genre_title;
      if created_genre_id is null
      then
        insert into library_genre (title)
        values (genre_title)
        returning genre_id
          into created_genre_id;
      end if;
      select array_append(returned_genres_ids, created_genre_id)
      into returned_genres_ids;
    end loop;

    -- create relations with those genres:
    foreach created_genre_id in array returned_genres_ids
    loop
      insert into library_book_genres (book_id, genre_id)
      values (returned_book_id, created_genre_id);
    end loop;
  end if;

  return (returned_book_id, returned_author_id, returned_genres_ids) :: import_book_import_result;
end;
$function_create_book$;


create or replace function import_create_books_from_raw_rdfs(
  wipe_previous_books bool,
  verbosity           integer = 0
)
  returns integer
language plpgsql
volatile
as $function_create_books_from_raw_rdfs$
declare
  nb_books_created               integer = 0;
  current_raw_book_data          record;
  current_created_book           import_book_import_result;
  current_raw_book_asset_data    record;
  current_book_nb_assets_created integer;
  imported_book_data             import_gutenberg_imported_book;
begin
  if wipe_previous_books
  then
    truncate library_book_additional_data, library_book, library_author, library_genre, library_book_genres, library_book_asset cascade;
  end if;

  for current_raw_book_data in
  select
    gutenberg_id,
    rdf_content,
    assets,
    intro
  from
    gutenberg_raw_data
  where
    -- We only import books matching the following criteria:
    -- 1) it must have a epub file
    assets ? 'epub'
    -- 2) it must not be a periodical (category "AP")
    and rdf_content :: text not like '%<rdf:value>AP</rdf:value>%'
  loop
    -- A) Create books, their authors and their literary genres
    imported_book_data = import_gutenberg_get_book_from_rdf(current_raw_book_data.rdf_content :: xml);
    select *
    into current_created_book
    from import_gutenberg_create_book(imported_book_data);

    -- B) Create the books assets
    current_book_nb_assets_created = 0;
    for current_raw_book_asset_data in select *
                                       from jsonb_each(current_raw_book_data.assets)
    loop
      insert into library_book_asset (book_id, type, path, size)
      values (
        current_created_book.book_id,
        current_raw_book_asset_data.key,
        current_raw_book_asset_data.value ->> 'path',
        (current_raw_book_asset_data.value ->> 'size') :: integer
      );
      current_book_nb_assets_created = current_book_nb_assets_created + 1;
    end loop;

    -- C) Handle book additional data (i.e. only the intro at the moment)
    if current_raw_book_data.intro is not null
    then
      insert into library_book_additional_data (book_id, intro)
      values (current_created_book.book_id, current_raw_book_data.intro);
    end if;

    nb_books_created = nb_books_created + 1;
    if (verbosity > 1 or (verbosity = 1 and nb_books_created % 100 = 0))
    then
      raise notice 'book % - pg%: % (% assets)', nb_books_created, current_raw_book_data.gutenberg_id, imported_book_data.title, current_book_nb_assets_created;
    end if;

  end loop;

  return nb_books_created;
end;
$function_create_books_from_raw_rdfs$;
