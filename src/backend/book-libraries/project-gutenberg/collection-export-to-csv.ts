import type { WriteStream } from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import { traverseGeneratedCollectionDirectory } from "./collection-traversing";
import { getBookToParseData } from "./book-assets-analyse";

export function dumpCollectionToCsv(booksCollectionFolderPath: string, csvOutput: WriteStream): Promise<number> {
    let writtenToCsvBooksCount = 0;

    const csvStream = csv.format({ headers: true });
    csvStream.pipe(csvOutput);

    return new Promise((resolve, reject) => {
        let totalBooksCount = -1;

        traverseGeneratedCollectionDirectory(booksCollectionFolderPath, onRdfCallback).then((booksCount) => {
            totalBooksCount = booksCount;
        }, reject);

        function onRdfCallback(rdfFilePath: string, bookId: number): void {
            getBookToParseData(path.dirname(rdfFilePath), bookId)
                .then((bookToParseData) => {
                    const csvRow = {
                        ...bookToParseData,
                        rdfContent: JSON.stringify(bookToParseData.rdfContent),
                        dirFilesSizes: JSON.stringify(bookToParseData.dirFilesSizes),
                    };
                    csvStream.write(csvRow);
                    writtenToCsvBooksCount++;
                    if (writtenToCsvBooksCount === totalBooksCount) {
                        csvStream.end(() => {
                            resolve(totalBooksCount);
                        });
                    }
                })
                .catch(reject);
        }

        csvStream.on("error", reject);
    });
}
