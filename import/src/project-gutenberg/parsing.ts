import { dirname, join } from "path";
import { fs as fsAsync } from "../utils/async-utils";
import { BookToParse } from "./domain";

// /!\ This is a length in bytes, not in chars.
// But we take the intro in a very vague way anyhow... :-)
const BOOK_INTRO_LENGTH = 5000;

export async function getBookToParseData(
  pgBookId: number,
  rdfFilePath: string
): Promise<BookToParse> {
  const bookFolderPath = dirname(rdfFilePath);
  const rdfContent = await getBookRdfFileContent(rdfFilePath);

  const dirFilesSizes = await getBookFilesSizes(bookFolderPath);

  const introFilePath = join(bookFolderPath, `pg${pgBookId}.txt.utf8`);
  const intro = await getBookIntro(introFilePath);
  const hasIntro = intro !== null;

  const coverFilePath = join(bookFolderPath, `pg${pgBookId}.cover.medium.jpg`);
  let hasCover = true;
  try {
    await fsAsync.accessAsync(coverFilePath);
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
  const rdfData = await fsAsync.readFileAsync(rdfFilePath, {
    encoding: "utf8",
  });

  if (!rdfData) {
    return Promise.reject(new Error(`Empty RDF file "${rdfFilePath}"`));
  }

  return rdfData;
}

async function getBookFilesSizes(bookFolderPath: string): Promise<{ [name: string]: number }> {
  const filesPathsInThatFolder: string[] = await fsAsync.readdirAsync(bookFolderPath);
  const result: { [name: string]: number } = {};
  for (const fileName of filesPathsInThatFolder) {
    const fileStats = await fsAsync.statAsync(join(bookFolderPath, fileName));
    result[fileName] = fileStats.size;
  }
  return result;
}

async function getBookIntro(introFilePath: string): Promise<string | null> {
  let textFile;
  try {
    textFile = await fsAsync.openAsync(introFilePath, "r");
  } catch (e) {
    return null;
  }
  const textBuffer = new Buffer(BOOK_INTRO_LENGTH);

  await fsAsync.readAsync(textFile, textBuffer, 0, BOOK_INTRO_LENGTH, 0);

  await fsAsync.closeAsync(textFile);

  return textBuffer.toString("utf8");
}
