import { Book } from "@goodauldbooks/library/domain";
import sqlite from "sqlite";
import { BookToParse } from "./domain";
import * as parsing from "./parsing";

const PARSE_BOOK_FROM_DB_LIMIT = 10;

const RAW_BOOKS_DB_SQL_TABLE_CREATION = `
create table raw_book(
  pg_book_id int not null,
  rdf_content text not null,
  dir_files_sizes text not null,
  has_intro int(1) not null,
  intro text,
  has_cover int(1) not null
)
`;

const RAW_BOOKS_DB_SQL_INSERT = `
insert into raw_book
  (pg_book_id, rdf_content, dir_files_sizes, has_intro, intro, has_cover)
values
  ($pgBookId, $rdfContent, $dirFilesSizes, $hasIntro, $intro, $hasCover)
`;

const RAW_BOOKS_DB_SQL_GET_ALL = `
select
  pg_book_id, rdf_content, dir_files_sizes, has_intro, intro, has_cover
from
  raw_book
order by
  pg_book_id
`;

export async function initBooksTransitionalDb(db: sqlite.Database): Promise<void> {
  await db.exec(RAW_BOOKS_DB_SQL_TABLE_CREATION);
}

export async function storeRawBookToParseInTransitionalDb(
  bookRawData: BookToParse,
  db: sqlite.Database
): Promise<void> {
  const bookDataForSql = getBookValuesForSql(bookRawData);

  await db.run(RAW_BOOKS_DB_SQL_INSERT, bookDataForSql);
}

export async function parseBooksFromTransitionalDb(
  db: sqlite.Database,
  onBookParsed: (book: Book) => void
): Promise<number> {
  let nbBooksParsed = 0;

  const sql = `${RAW_BOOKS_DB_SQL_GET_ALL} ${
    PARSE_BOOK_FROM_DB_LIMIT > 0 ? `LIMIT ${PARSE_BOOK_FROM_DB_LIMIT}` : ""
  }`;
  db.each(sql, onBookFromDb);

  function onBookFromDb(err: Error, rawBookRow: { [field: string]: any }) {
    const bookToParse: BookToParse = {
      pgBookId: rawBookRow.pg_book_id,
      rdfContent: rawBookRow.rdf_content,
      dirFilesSizes: JSON.parse(rawBookRow.dir_files_sizes),
      hasIntro: !!rawBookRow.has_intro,
      intro: rawBookRow.has_intro ? rawBookRow.intro : null,
      hasCover: !!rawBookRow.has_cover,
    };
    const book = parsing.parseBook(bookToParse);
    if (!book) {
      return;
    }
    onBookParsed(book);

    nbBooksParsed += 1;
  }

  return nbBooksParsed;
}

function getBookValuesForSql(bookRawData: BookToParse): { [field: string]: any } {
  return {
    $pgBookId: bookRawData.pgBookId,
    $rdfContent: bookRawData.rdfContent,
    $dirFilesSizes: JSON.stringify(bookRawData.dirFilesSizes),
    $hasIntro: bookRawData.hasIntro ? 1 : 0,
    $intro: bookRawData.hasIntro ? bookRawData.intro : null,
    $hasCover: bookRawData.hasCover ? 1 : 0,
  };
}
