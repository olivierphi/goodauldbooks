begin;

drop schema if exists webapp cascade;
create schema webapp;

/**
 * Tables
 */

create table webapp.settings(
  name text unique primary key,
  value text
);

/**
 * Some default values
 */
insert into webapp.settings(name, value) values
  ('featured_books_ids', '["pg345", "pg84", "pg174"]')
;

commit;
