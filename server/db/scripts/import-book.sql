/**
 * Variables for this script:
 *  - rdf: the content of a Project Gutenberg RDF file
 */
begin;

select
  *
from
  import.gutenberg_create_book(
    import.gutenberg_get_book_from_rdf(:'rdf')
  )
;

commit;
