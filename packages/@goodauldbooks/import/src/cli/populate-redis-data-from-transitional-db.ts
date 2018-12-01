#!/usr/bin/env node
import { Book } from "@goodauldbooks/library/domain";
import sqlite from "sqlite";
import * as transitionalDb from "../project-gutenberg/transitional-db";

async function onBookFromDb(book: Book): Promise<void> {
  console.log(
    "book=",
    book.title,
    book.authors.map(author => (author ? `${author.firstName} ${author.lastName}` : null))
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
