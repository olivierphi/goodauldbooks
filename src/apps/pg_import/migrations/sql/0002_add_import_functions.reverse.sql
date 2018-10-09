

drop function if exists import_gutenberg_get_book_from_rdf;
drop function if exists import_gutenberg_create_book;
drop function if exists import_create_books_from_raw_rdfs;

drop type if exists import_gutenberg_imported_book;
drop type if exists import_gutenberg_imported_author;
drop type if exists import_gutenberg_imported_book_additional_data;
drop type if exists import_book_import_result;

drop function if exists utils_array_remove_nulls;
