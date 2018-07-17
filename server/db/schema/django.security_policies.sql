do
$do_revoke$
begin
  if (
       select count(*)
       from
         pg_catalog.pg_roles
       where
         rolname in ('django_user')
     ) > 0
  then
    revoke usage on schema
    django, library, library_view, utils, webapp
    from
    django_user
    cascade;

    revoke create on schema
    django
    from
    django_user
    cascade;

    revoke all privileges on all tables in schema
    library, library_view, utils, webapp
    from
    django_user
    cascade;

    revoke all privileges on all functions in schema
    library, library_view, utils, webapp
    from
    django_user
    cascade;
  end if;
end;
$do_revoke$;

create schema if not exists django;

drop role if exists django_user;

create role django_user
  noinherit
  login
  password 'django_pass'; -- change that hard-coded password later of course ^_^

grant usage on schema
django, library, library_view, utils, webapp
to
django_user;

grant create on schema
django
to
django_user;

grant select on table
library.book,
library.author,
library.genre,
library.book_genre,
library.book_additional_data,
library_view.book_computed_data,
library_view.author_computed_data,
library_view.genre_with_related_data,
webapp.settings
to
django_user;

alter role django_user set search_path = django;
revoke usage on schema public from django_user;
