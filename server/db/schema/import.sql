begin;

drop schema if exists import;
create schema import;

/**
 * Tables
 */
create table import.pg_book (
    book_id serial primary key,
    pg_id int,
    title varchar(300)
);

create table import.pg_author (
    author_id serial primary key,
    pg_id int,
    first_name varchar(300),
    last_name varchar(300)
);

alter table import.pg_book add column
    author_id int references import.pg_author(author_id) not null;

/**
 * Functions
 */

create type import.pg_imported_author as (
  full_name varchar(300),
  first_name varchar(300),
  last_name varchar(300),
  alias varchar(100),
  birth_year integer,
  death_year integer
);

create type import.pg_imported_book as (
  title varchar(300),
  slug varchar(300),
  author import.pg_imported_author
);

create or replace function import.slugify(
    base_string text
) returns text
language sql
as $function$
    -- @link http://schinckel.net/2015/12/16/slugify%28%29-for-postgres-%28almost%29/ :-)
    with
    normalized as (
        select unaccent(base_string) as value
    ),
    remove_chars as (
        select regexp_replace(value, e'[^\\w\\s-]', '', 'gi') as value
        from normalized
    ),
    lowercase as (
        select lower(value) as value
        from remove_chars
    ),
    trimmed as (
        select trim(value) as value
        from lowercase
    ),
    hyphenated as (
        select regexp_replace(value, e'[-\\s]+', '-', 'gi') as value
        from trimmed
    )
    select value from hyphenated;
$function$;

create or replace function import.pg_get_book_from_rdf(
  rdf_data xml
) returns import.pg_imported_book
language sql
as $function$
    with 
    rdf_raw_parsing as (
        select
        -- book data
        trim( unnest( xpath(
            '//dcterms:title/text()',
            rdf_data,
            array[ array['dcterms', 'http://purl.org/dc/terms/'] ]
        ) )::text ) as book_title,
        -- author data
        trim( unnest( xpath(
            '//dcterms:creator/pgterms:agent/pgterms:name/text()',
            rdf_data,
            array[ array['dcterms', 'http://purl.org/dc/terms/'], array['pgterms', 'http://www.gutenberg.org/2009/pgterms/'] ]
        ) )::text ) as author_name,
        trim( unnest( xpath(
            '//dcterms:creator/pgterms:agent/pgterms:alias/text()',
            rdf_data,
            array[ array['dcterms', 'http://purl.org/dc/terms/'], array['pgterms', 'http://www.gutenberg.org/2009/pgterms/'] ]
        ) )::text ) as author_alias,
        trim( unnest( xpath(
            '//dcterms:creator/pgterms:agent/pgterms:birthdate/text()',
            rdf_data,
            array[ array['dcterms', 'http://purl.org/dc/terms/'], array['pgterms', 'http://www.gutenberg.org/2009/pgterms/'] ]
        ) )::text ) as author_birth_year,
        trim( unnest( xpath(
            '//dcterms:creator/pgterms:agent/pgterms:deathdate/text()',
            rdf_data,
            array[ array['dcterms', 'http://purl.org/dc/terms/'], array['pgterms', 'http://www.gutenberg.org/2009/pgterms/'] ]
        ) )::text ) as author_death_year
    ),
    regexp_parsing as (
        select
            rdf_raw_parsing.*, 
            regexp_split_to_array(author_name, e'\\s*,\\s*') as author_name_array
        from
            rdf_raw_parsing
    )
    select
      (
        -- book fields (see the definition of the "import.pg_imported_book" composite type)
        book_title,
        import.slugify(format('%s-%s', book_title, author_name)),
        (
            -- author fields (see the definition of the "import.pg_imported_author" composite type)
            author_name,
            trim( author_name_array[2] ),
            trim( author_name_array[1] ),
            author_alias,
            author_birth_year::integer,
            author_death_year::integer
        )::import.pg_imported_author
      )::import.pg_imported_book
    from
        regexp_parsing
    ;
$function$;

-- \d import.*

select
    (book).* as book,
    (book.author).* as author
from
    import.pg_get_book_from_rdf(:'rdf') as book
;

rollback;