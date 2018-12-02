#!/usr/bin/env node
import * as transitionalDb from "@goodauldbooks/import/project-gutenberg/transitional-db";
import { Book } from "@goodauldbooks/library/domain";
import sqlite from "sqlite";

async function onBookFromDb(book: Book): Promise<void> {
  console.log(
    "book=",
    book.title,
    book.authors.map(author =>
      author ? `${author.firstName} ${author.lastName ? author.lastName.toUpperCase() : ""}` : null
    )
  );
}

(async () => {
  if (process.argv.length < 3) {
    console.error("Mandatory database path argument missing.");
    process.abort();
  }
  const dbPath = process.argv[2];
  const db = await sqlite.open(dbPath);
  const nbBooksProcessed = await transitionalDb.parseBooksFromTransitionalDb(db, onBookFromDb);
  console.log("nbBooksProcessed:", nbBooksProcessed);
})();
