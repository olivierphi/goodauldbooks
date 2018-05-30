
/**
 * Postgrest users configuration
 * @link https://postgrest.com/en/v4.4/auth.html
 */
do
$do_revoke$
begin
  if (
   select
     count(*)
   from
     pg_catalog.pg_roles
   where
     rolname in ('api_public_authenticator', 'api_public_anon')
  ) > 1 then
    revoke usage on schema
      api_public, library, library_view, utils, webapp
    from
      api_public_authenticator, api_public_anon
    cascade;

    revoke all privileges on all tables in schema
      api_public, library, library_view, webapp
    from
      api_public_authenticator, api_public_anon
    cascade;

    revoke all privileges on all functions in schema
      api_public, library, library_view, utils, webapp
    from
      api_public_authenticator, api_public_anon
    cascade;
  end if;
end;
$do_revoke$;

drop role if exists api_public_authenticator;
drop role if exists api_public_anon;

create role api_public_anon nologin;

create role api_public_authenticator noinherit login password 'devpassword'; -- change that hard-coded password later of course ^_^
grant api_public_anon to api_public_authenticator;

-- "Anonymous" role permissions. We have to be very careful with that! :-)
grant usage on schema
  api_public, library, library_view, utils, webapp
to
  api_public_anon;
grant select on table
  library_view.book_with_related_data,
  library_view.genre_with_related_data,
  library_view.book_additional_data,
  webapp.settings
to
  api_public_anon;

grant execute on function
  api_public.search_books(pattern text),
  api_public.quick_autocompletion(pattern text),
  api_public.featured_books(),
  api_public.get_book_by_id(book_id text),
  api_public.get_book_intro(book_id text),
  utils.get_book_real_id(book_public_id text)
to
  api_public_anon;
