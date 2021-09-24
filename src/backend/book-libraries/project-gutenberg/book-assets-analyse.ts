import * as path from "path";
import * as fs from "fs/promises";
import type { BookToParse } from "./domain";

// /!\ This is a length in bytes, not in chars.
// But we take the intro in a very vague way anyhow... :-)
const BOOK_INTRO_LENGTH = 5000;

export async function getBookToParseData(pgBookFolderPath: string, pgBookId: number): Promise<BookToParse> {
    const rdfFilePath = path.join(pgBookFolderPath, `pg${pgBookId}.rdf`);
    const rdfContent = await getBookRdfFileContent(rdfFilePath);

    const dirFilesSizes = await getBookFilesSizes(pgBookFolderPath);

    const introFilePath = path.join(pgBookFolderPath, `pg${pgBookId}.txt.utf8`);
    const intro = await getBookIntro(introFilePath);
    const hasIntro = intro !== null;

    const coverFilePath = path.join(pgBookFolderPath, `pg${pgBookId}.cover.medium.jpg`);
    let hasCover = true;
    try {
        await fs.access(coverFilePath);
    } catch (e) {
        hasCover = false;
    }

    return {
        pgBookId,
        rdfContent,
        dirFilesSizes,
        hasIntro,
        intro,
        hasCover,
    };
}

async function getBookRdfFileContent(rdfFilePath: string): Promise<string> {
    const rdfData = await fs.readFile(rdfFilePath, {
        encoding: "utf8",
    });

    if (!rdfData) {
        throw new Error(`Empty RDF file "${rdfFilePath}"`);
    }

    return rdfData;
}

async function getBookFilesSizes(bookFolderPath: string): Promise<{ [name: string]: number }> {
    const filesPathsInThatFolder: string[] = await fs.readdir(bookFolderPath);
    const result: { [name: string]: number } = {};
    for (const fileName of filesPathsInThatFolder) {
        const fileStats = await fs.stat(path.join(bookFolderPath, fileName));
        result[fileName] = fileStats.size;
    }
    return result;
}

async function getBookIntro(introFilePath: string): Promise<string | null> {
    let textFile: fs.FileHandle;
    try {
        textFile = await fs.open(introFilePath, "r");
    } catch (e) {
        return null;
    }
    const textBuffer = Buffer.alloc(BOOK_INTRO_LENGTH);
    const { bytesRead } = await textFile.read(textBuffer, 0, BOOK_INTRO_LENGTH, 0);
    await textFile.close();

    return textBuffer.subarray(0, bytesRead).toString("utf8").trim();
}
