import sqlite from "sqlite";
import { BookToParse } from "./domain";

const RAW_BOOKS_DB_SQL_TABLE_CREATION = `
create table raw_book(
    pg_book_id int not null,
    rdf_content text not null,
    dir_files_sizes text not null,
    has_intro int(1) not null,
    intro text,
    has_cover int(1) not null
);
`;

const RAW_BOOKS_DB_SQL_INSERT = `
insert into raw_book
  (pg_book_id, rdf_content, dir_files_sizes, has_intro, intro, has_cover)
values
  ($pgBookId, $rdfContent, $dirFilesSizes, $hasIntro, $intro, $hasCover);
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
