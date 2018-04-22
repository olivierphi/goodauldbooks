-- nb books by lang:
with
grouped_books as(
  select
    lang, count(*) as nb
  from
    import.gutenberg_book
  group by
    lang
)
select format('Nb books for this lang: %s', nb), lang from grouped_books order by nb desc;

-- literary genres with more than one book:
with
grouped_genres as (
  select
    title, count(*) as nb
  from
    import.gutenberg_book_genres
      join import.gutenberg_genre using(genre_id)
  group by
    title
)
select format('Nb books for this genre: %s', nb), title from grouped_genres where nb > 1 order by nb desc;
