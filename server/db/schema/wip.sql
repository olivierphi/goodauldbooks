
create or replace function import.create_books_from_raw_rdfs(
  wipe_previsous_books bool
) returns integer
language plpgsql
volatile
as $function_create_books_from_raw_rdfs$
declare
  nb_books_created integer = 0;
  current_raw_book_data record;
  imported_book_data import.gutenberg_imported_book;
begin
  if wipe_previsous_books then
    truncate import.gutenberg_book, import.gutenberg_author, import.gutenberg_genre, import.gutenberg_book_genres;
  end if;

  for current_raw_book_data in
    select
      gutenberg_id,
      rdf_content
    from
      import.gutenberg_raw_rdf_files
    where
      -- We only import books matching the following criteria:
      -- 1) it must have a epub file
      assets ? 'epub'
      -- 2) it must not be a periodical (category "AP")
      and rdf_content::text not like '%<rdf:value>AP</rdf:value>%'
   loop
    imported_book_data = import.gutenberg_get_book_from_rdf(current_raw_book_data.rdf_content);
    perform import.gutenberg_create_book(imported_book_data);
    nb_books_created = nb_books_created + 1;
    raise notice 'book % title: %', current_raw_book_data.gutenberg_id, imported_book_data.title;
  end loop;

  return nb_books_created;
end;
$function_create_books_from_raw_rdfs$;

select * from import.create_books_from_raw_rdfs(true);
