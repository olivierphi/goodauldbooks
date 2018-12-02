#!/usr/bin/env ts-node
import { getBookToParseData } from "@goodauldbooks/import/project-gutenberg/parsing";
import * as transitionalDb from "@goodauldbooks/import/project-gutenberg/transitional-db";
import { traverseGeneratedCollectionDirectory } from "@goodauldbooks/import/project-gutenberg/traversing";
import sqlite from "sqlite";

async function onRdfCallback(
  db: sqlite.Database,
  rdfFilePath: string,
  bookId: number
): Promise<void> {
  const bookToParse = await getBookToParseData(bookId, rdfFilePath);
  console.log(
    `${bookToParse.pgBookId}: rdfSize=${bookToParse.rdfContent.length}, hasIntro=${
      bookToParse.hasIntro
    }, hasCover=${bookToParse.hasCover}`
  );
  transitionalDb.storeRawBookToParseInTransitionalDb(bookToParse, db);
}

(async () => {
  if (process.argv.length < 3) {
    console.error("Mandatory Projet Gutenberg 'generated collection' path argument missing.");
    process.abort();
  }
  if (process.argv.length < 4) {
    console.error("Mandatory database path argument missing.");
    process.abort();
  }
  const collectionPath = process.argv[2];
  const dbPath = process.argv[3];
  const db = await sqlite.open(dbPath);
  transitionalDb.initBooksTransitionalDb(db);
  const nbBooksFound = await traverseGeneratedCollectionDirectory(
    collectionPath,
    onRdfCallback.bind(null, db)
  );
  console.log("nbBooksFound:", nbBooksFound);
})();
