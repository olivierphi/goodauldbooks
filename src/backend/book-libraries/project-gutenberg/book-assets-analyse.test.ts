import * as path from "path";
import * as fs from "fs/promises";
import { getBookToParseData } from "./book-assets-analyse";
import type { BookToParse } from "./domain";

test("It can parse the content of a Project Gutenberg 'generated' book folder", async () => {
    const bookFolderPath = path.join(__dirname, "../../../../test/data/project-gutenberg/345-dracula");
    const bookToParseData = await getBookToParseData(bookFolderPath, 345);
    const rdfContent = await fs.readFile(path.join(bookFolderPath, "pg345.rdf"), { encoding: "utf8" });

    const expectedBookToParseData: BookToParse = {
        pgBookId: 345,
        rdfContent,
        dirFilesSizes: {
            "345-cover.png": 38048,
            "pg345-images.epub": 26,
            "pg345-images.mobi": 26,
            "pg345.cover.medium.jpg": 11333,
            "pg345.cover.small.jpg": 2197,
            "pg345.epub": 19,
            "pg345.mobi": 19,
            "pg345.rdf": 17312,
            "pg345.txt.utf8": 12,
        },
        hasIntro: true,
        hasCover: true,
        intro: "dummy intro",
    };
    expect(bookToParseData).toEqual(expectedBookToParseData);
});
