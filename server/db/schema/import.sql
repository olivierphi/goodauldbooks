begin;

drop schema if exists import cascade;
create schema import;

/**
 * I would have liked to prefix all this "Project Gutenberg" stuff with "pg_", but it's generally
 * not a good idea to do so in a PostgreSQL context, which already uses this very same prefix for its own internal stuff :-)
 * This is why I ended up choosing the longer "gutenberg_" prefix.
 */


/**
 * Tables
 */

create table import.gutenberg_raw_data (
  gutenberg_id integer unique not null primary key,
  rdf_content xml not null,
  assets jsonb not null,
  intro text null,
  imported_at timestamp not null default now()
);


/**
 * Functions (and their composite types)
 */
\ir 'import_functions.sql'

commit;
