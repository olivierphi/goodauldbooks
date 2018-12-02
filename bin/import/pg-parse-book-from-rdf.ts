#!/usr/bin/env ts-node
import { getBookToParseData, parseBook } from "@goodauldbooks/import/project-gutenberg/parsing";

(async () => {
  if (process.argv.length < 3) {
    console.error("Mandatory RDF file path argument missing.");
    process.abort();
  }
  const rdfFilePath = process.argv[2];
  const bookId = parseInt(rdfFilePath.replace(/\/pg(\d+)\.rdf$/, "$1"), 10);
  const bookToParseData = await getBookToParseData(bookId, rdfFilePath);
  const book = parseBook(bookToParseData);
  console.log(book);
})();
