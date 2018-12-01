#!/usr/bin/env node
import sqlite from "sqlite";
import { getBookToParseData } from "../project-gutenberg/parsing";
import * as transitionalDb from "../project-gutenberg/transitional-db";
import { traverseGeneratedCollectionDirectory } from "../project-gutenberg/traversing";

const localFolderPath = "/home/oliv/gutenberg-mirror/generated-collection";

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
    console.error("Mandatory database path argument missing.");
    process.abort();
  }
  const dbPath = process.argv[2];
  const db = await sqlite.open(dbPath);
  transitionalDb.initBooksTransitionalDb(db);
  const nbBooksFound = await traverseGeneratedCollectionDirectory(
    localFolderPath,
    onRdfCallback.bind(null, db)
  );
  console.log("nbBooksFound:", nbBooksFound);
})();
