\set ECHO none 
\set QUIET 1
\t on
\pset format unaligned
\pset pager off

with
langs_by_nb_books as (
  select
    lang,
    count(*) as nb
  from
    library.book
  group by
    lang
),
rows_as_json_hashes as (
  select
    json_object('{lang, nb}', array[lang, nb]::text[])
  from
    langs_by_nb_books
  order by
    nb desc
)
select
  json_agg(json_object)
from
  rows_as_json_hashes
;