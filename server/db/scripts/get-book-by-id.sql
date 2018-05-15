\timing

select
  jsonb_pretty(
    row_to_json(
      api_public.get_book_by_id(book_id => :'book_id')
    )::jsonb
  )
;
