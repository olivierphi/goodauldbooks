
drop function if exists library_view_update_book_computed_data;
drop function if exists library_view_update_author_computed_data;
drop function if exists library_view_update_all_books_computed_data;
drop function if exists library_view_update_all_authors_computed_data;

drop table if exists library_view_book_computed_data;

drop table if exists library_view_author_computed_data;

drop materialized view if exists library_view_genre_with_related_data;

drop extension if exists pg_trgm;

drop extension if exists unaccent;
drop function if exists utils_slugify;
