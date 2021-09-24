import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";
import { createWriteStream, createReadStream } from "fs";
import * as csv from "fast-csv";
import { dumpCollectionToCsv } from "./collection-export-to-csv";

test("it can dump a Gutenberg books collection to a raw CSV file", async () => {
    const booksCollectionFolderPath = path.join(__dirname, "../../../../test/data/project-gutenberg");
    const csvOutputDir = await fs.mkdtemp(path.join(os.tmpdir(), "goodauldbooks-"));
    const csvOutputFilePath = path.join(csvOutputDir, "gutenberg-collection.csv");
    const csvOutputStream = createWriteStream(csvOutputFilePath);

    const booksCount = await dumpCollectionToCsv(booksCollectionFolderPath, csvOutputStream);
    expect(booksCount).toBe(2);

    const csvInputStream = createReadStream(csvOutputFilePath);
    const csvRows = [];
    const readCsvPromise = new Promise((resolve, reject) => {
        csvInputStream
            .pipe(csv.parse({ headers: true }))
            .on("data", (row) => {
                csvRows.push(row);
            })
            .on("end", resolve)
            .on("error", reject);
    });
    await readCsvPromise;

    expect(csvRows.length).toBe(booksCount);
    const expectedBooksDataFields = csvRows.map((row) => row.pgBookId);
    expect(expectedBooksDataFields).toEqual(["84", "345"]);
});
