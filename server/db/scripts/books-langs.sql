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
nb_books_total as (
  select
    'all' as lang,
    count(*) as nb
  from
    library.book
),
langs_by_nb_books_with_total as (
  (select lang, nb from nb_books_total)
  union all
  (select lang, nb from langs_by_nb_books)
),
rows_as_json_hashes as (
  select
    json_object('{lang, nb}', array[lang, nb]::text[])
  from
    langs_by_nb_books_with_total
  order by
    nb desc
)
select
  json_agg(json_object)
from
  rows_as_json_hashes
;
