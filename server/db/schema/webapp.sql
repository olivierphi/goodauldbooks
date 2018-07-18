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


commit;
