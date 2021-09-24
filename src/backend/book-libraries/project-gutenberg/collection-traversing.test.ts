import * as path from "path";
import { traverseGeneratedCollectionDirectory } from "./collection-traversing";

test("It can traverse a 'generated' Project Gutenberg books collection folder", async () => {
    const booksCollectionFolderPath = path.join(__dirname, "../../../../test/data/project-gutenberg");
    const traversedBooks = [];
    const onRdfCallback = (rdfFilePath: string, bookId: number) => {
        traversedBooks.push({ rdfFilePath, bookId });
    };
    await traverseGeneratedCollectionDirectory(booksCollectionFolderPath, onRdfCallback);

    const expectedTraversedCollectionResult = [
        { rdfFilePath: path.join(booksCollectionFolderPath, "345-dracula", "pg345.rdf"), bookId: 345 },
        { rdfFilePath: path.join(booksCollectionFolderPath, "84-frankenstein", "pg84.rdf"), bookId: 84 },
    ];
    expect(traversedBooks).toEqual(expectedTraversedCollectionResult);
});
