begin;

/**
 * Books to highlight when people search for books:
 */
update
  library.book
set
  highlight = 100
where
  gutenberg_id = any(array[
      11, -- Alice's Adventures in Wonderland by Lewis Carroll
      43, -- The Strange Case of Dr. Jekyll and Mr. Hyde by Robert Louis Stevenson
      74, -- The Adventures of Tom Sawyer by Mark Twain
      84, -- Frankenstein; Or, The Modern Prometheus by Mary Wollstonecraft Shelley
      98, -- A Tale of Two Cities by Charles Dickens
      219, -- Heart of Darkness by Joseph Conrad
      345, -- Dracula by Bram Stoker
      844, -- The Importance of Being Earnest: A Trivial Comedy for Serious People by Oscar Wilde
      1342, -- Pride and Prejudice by Jane Austen
      2701, -- Moby Dick; Or, The Whale by Herman Melville
      5200 -- Metamorphosis by Franz Kafka
  ])
;

/**
 * Books we display on the homepage:
 */
insert into webapp.settings(name, value) values
  ('featured_books_ids', '["pg345", "pg84", "pg174"]')
;

commit;
