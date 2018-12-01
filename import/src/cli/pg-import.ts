import { getBookToParseData } from "../project-gutenberg/parsing";
import { traverseGeneratedCollectionDirectory } from "../project-gutenberg/traversing";

const localFolderPath = "/home/oliv/gutenberg-mirror/generated-collection";

async function onRdfCallback(rdfFilePath: string, bookId: number): Promise<void> {
  const bookToParse = await getBookToParseData(bookId, rdfFilePath);
  console.log(
    `${bookToParse.pgBookId}: rdfSize=${bookToParse.rdfContent.length}, hasIntro=${
      bookToParse.hasIntro
    }, hasCover=${bookToParse.hasCover}`
  );
}

(async () => {
  const nbBooksFound = await traverseGeneratedCollectionDirectory(localFolderPath, onRdfCallback);
  console.log("nbBooksFound:", nbBooksFound);
})();
