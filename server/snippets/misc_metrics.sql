-- Author with multiple books:
SELECT
(author.first_name || '' || author.last_name) AS author_name,
COUNT(author_books.author_id) AS nb_books
FROM author
LEFT JOIN author_books ON author.id = author_books.author_id
GROUP BY author_name
HAVING COUNT(author_books.author_id) > 1
ORDER BY nb_books DESC
;
