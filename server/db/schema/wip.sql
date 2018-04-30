
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

select * from import.create_books_from_raw_rdfs(true);
