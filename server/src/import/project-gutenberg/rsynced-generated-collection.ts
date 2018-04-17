import { EventEmitter } from "events";
import * as fastGlob from "fast-glob";
import { dirname } from "path";
import { EmittedEvents } from ".";
import { ImportedBook } from "../../domain/import";
import * as asyncUtils from "../../utils/async-utils";
import { storeImportedBookIntoDatabase } from "./database-storage";
import { NotABookError } from "./errors";
import { extractBookDataFromRdfFile } from "./rdf-parsing";

export async function traverseDirectoryAndIndexBooks(
  localFolderPath: string,
  options: { eventEmitter?: EventEmitter } = {}
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    let rdfFileStreamFinished: boolean = false;
    let nbBooksImportsStarted: number = 0;
    let nbBooksImportsFinished: number = 0;

    const jobsDone = () =>
      rdfFileStreamFinished && nbBooksImportsFinished === nbBooksImportsStarted;

    const rdfFilesStream = fastGlob.stream([`${localFolderPath}/**/pg*.rdf`], {
      absolute: true,
      unique: true,
    });

    rdfFilesStream.on("data", async (rdfFilePath: string) => {
      const rdfRgexepMatch = rdfFilePath.match(/pg(\d+)\.rdf$/);
      if (rdfRgexepMatch && rdfRgexepMatch.length) {
        const bookId = parseInt(rdfRgexepMatch[1], 10);
        const bookFolderPath = dirname(rdfFilePath);
        nbBooksImportsStarted++;
        try {
          await importBookFromGeneratedCollectionFiles(bookFolderPath, bookId);
        } catch (e) {
          options.eventEmitter && options.eventEmitter.emit(EmittedEvents.IMPORT_ERROR, e);
        }
        nbBooksImportsFinished++;
        if (jobsDone()) {
          resolve(nbBooksImportsFinished);
        }
      }
    });
    rdfFilesStream.once("error", e => {
      console.log("RDF files stream error", e);
      reject(e);
    });
    rdfFilesStream.once("end", () => {
      rdfFileStreamFinished = true;
      if (jobsDone()) {
        resolve(nbBooksImportsFinished);
      }
    });
  });
}

export async function importBookFromGeneratedCollectionFiles(
  bookFolderPath: string,
  bookId: number
): Promise<boolean> {
  const rdfFilePath = await getBookRdfFilePath(bookFolderPath, bookId);
  if (!rdfFilePath) {
    return Promise.reject(
      new Error(`No RDF file path found for book ${bookId} in path ${bookFolderPath}`)
    );
  }

  let bookData: ImportedBook;
  try {
    bookData = await extractBookDataFromRdfFile(rdfFilePath);
  } catch (e) {
    if (e instanceof NotABookError) {
      return Promise.resolve(true); // Not a book? Not a problem, just move on :-)
    }
    return Promise.reject(e);
  }

  if (!bookData.title) {
    return Promise.reject(new Error(`Book #${bookData.gutenbergId} has no title`));
  }

  const coverFilePath = await getBookCoverFilePath(bookFolderPath, bookId);
  if (coverFilePath) {
    bookData.coverFilePath = coverFilePath;
  }
  const bookEntity = await storeImportedBookIntoDatabase(bookData);
  return Promise.resolve(true);
}

async function getBookRdfFilePath(bookFolderPath: string, bookId: number): Promise<string | null> {
  const rdfFilePath = `${bookFolderPath}/pg${bookId}.rdf`;
  try {
    const coverFileStats = await asyncUtils.fs.statAsync(rdfFilePath);
    if (coverFileStats.isFile) {
      return Promise.resolve(rdfFilePath);
    }
  } catch (e) {}

  return Promise.resolve(null);
}

async function getBookCoverFilePath(
  bookFolderPath: string,
  bookId: number
): Promise<string | null> {
  const coverFilePath = `${bookFolderPath}/pg${bookId}.cover.medium.jpg`;
  try {
    const coverFileStats = await asyncUtils.fs.statAsync(coverFilePath);
    if (coverFileStats.isFile) {
      return Promise.resolve(coverFilePath);
    }
  } catch (e) {}

  return Promise.resolve(null);
}
