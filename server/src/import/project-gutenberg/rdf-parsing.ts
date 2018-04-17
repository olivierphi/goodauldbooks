import { EventEmitter } from "events";
import * as traverse from "traverse";
import { ImportedAuthor, ImportedBook, Lang } from "../../domain/import";
import * as asyncUtils from "../../utils/async-utils";
import { NotABookError } from "./errors";
import { emitEvent, EmittedEvents } from "./index";
/**
 * I could have used XPath and stuff like that, but I really dislike XML parsing, so why not
 * converting all the XML data into a big object and then retrive its data via Traverser?
 * Probably not the most efficient way to do it, sure, but this should do the job for the moment ^_^
 */

const BOOK_CATEGORY_RDF_RESOURCE_TYPE = "http://purl.org/dc/terms/LCSH";

export async function extractBookDataFromRdfXmlData(
  rdfDataXmlString: string,
  options: { eventEmitter?: EventEmitter } = {}
): Promise<ImportedBook> {
  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_PARSING_START);

  const rdfData = await asyncUtils.xml.parseXmlStringAsync(rdfDataXmlString);
  const rdfDataTraverser = traverse(rdfData);

  const gutenbergId = getProjectGutenbergId(rdfDataTraverser);

  const type = getType(rdfDataTraverser);
  if (type !== "Text") {
    return Promise.reject(new NotABookError(gutenbergId));
  }

  let author: ImportedAuthor | null;
  try {
    author = getAuthor(rdfDataTraverser);
  } catch (e) {
    console.log(`Unable to parse author data for book id #${gutenbergId}`);
    return Promise.reject(e);
  }
  const lang = getLanguage(rdfDataTraverser);
  const title = getTitle(rdfDataTraverser);
  const genres = getGenres(rdfDataTraverser);

  const importedBook: ImportedBook = {
    gutenbergId,
    author,
    lang,
    title,
    genres,
    coverFilePath: null,
  };

  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_PARSING_END);

  return Promise.resolve(importedBook);
}

export async function extractBookDataFromRdfFile(
  rdfFilePath: string,
  encoding: string = "utf8",
  options: { eventEmitter?: EventEmitter } = {}
) {
  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_FILE_READ_START);
  const rdfData = await asyncUtils.fs.readFileAsync(rdfFilePath, { encoding });
  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_FILE_READ_END);

  if (!rdfData) {
    return Promise.reject(new Error(`Empty RDF file "${rdfFilePath}"`));
  }

  try {
    return await extractBookDataFromRdfXmlData(rdfData, options);
  } catch (e) {
    return Promise.reject(e);
  }
}

function getProjectGutenbergId(rdfTraverser: traverse.Traverse<{}>): number {
  const projectGutenbergIdStr = rdfTraverser.get([
    "rdf:RDF",
    "pgterms:ebook",
    "0",
    "$",
    "rdf:about",
  ]);

  const gutenbergBookId = parseInt(projectGutenbergIdStr.replace(/^ebooks\/(\d+)$/, "$1"), 10);

  return gutenbergBookId;
}

function getType(rdfTraverser: traverse.Traverse<{}>): string {
  return rdfTraverser.get([
    "rdf:RDF",
    "pgterms:ebook",
    "0",
    "dcterms:type",
    "0",
    "rdf:Description",
    "0",
    "rdf:value",
    "0",
  ]);
}

function getPublisher(rdfTraverser: traverse.Traverse<{}>): string {
  return rdfTraverser.get(["rdf:RDF", "pgterms:ebook", "0", "dcterms:publisher", "0"]);
}

function getTitle(rdfTraverser: traverse.Traverse<{}>): string {
  return rdfTraverser.get(["rdf:RDF", "pgterms:ebook", "0", "dcterms:title", "0"]);
}

function getLanguage(rdfTraverser: traverse.Traverse<{}>): Lang {
  return rdfTraverser.get([
    "rdf:RDF",
    "pgterms:ebook",
    "0",
    "dcterms:language",
    "0",
    "rdf:Description",
    "0",
    "rdf:value",
    "0",
    "_",
  ]);
}

function getAuthor(rdfTraverser: traverse.Traverse<{}>): ImportedAuthor | null {
  const authorRaw: any = rdfTraverser.get([
    "rdf:RDF",
    "pgterms:ebook",
    "0",
    "dcterms:creator",
    "0",
    "pgterms:agent",
    "0",
  ]);

  if (!authorRaw) {
    return null;
  }

  const projectGutenbergAgentStr: string = authorRaw.$["rdf:about"];
  const birthYearStr: string | null = authorRaw["pgterms:birthdate"]
    ? authorRaw["pgterms:birthdate"]["0"]._
    : null;
  const deathYearStr: string | null = authorRaw["pgterms:deathdate"]
    ? authorRaw["pgterms:deathdate"]["0"]._
    : null;
  const wikipediaUrl: string | null = authorRaw["pgterms:webpage"]
    ? authorRaw["pgterms:webpage"]["0"].$["rdf:resource"]
    : null;
  const nameStr: string = authorRaw["pgterms:name"]["0"];

  const gutenbergAuthorId = parseInt(
    projectGutenbergAgentStr.replace(/^\d{4}\/agents\/(\d+)$/, "$1"),
    10
  );
  const [lastName, firstName] = nameStr.split(", ");

  return {
    gutenbergId: gutenbergAuthorId,
    firstName,
    lastName,
    wikipediaUrl,
    birthYear: birthYearStr ? parseInt(birthYearStr, 10) : null,
    deathYear: deathYearStr ? parseInt(deathYearStr, 10) : null,
  };
}

function getGenres(rdfTraverser: traverse.Traverse<{}>): string[] {
  const categoriesRaw: Array<{}> = rdfTraverser.get([
    "rdf:RDF",
    "pgterms:ebook",
    "0",
    "dcterms:subject",
  ]);

  if (!categoriesRaw) {
    return [];
  }

  const categories = categoriesRaw.map((dcTermsSubjectData: any): string => {
    const rdfDescription = dcTermsSubjectData["rdf:Description"][0];
    if (rdfDescription["dcam:memberOf"][0].$["rdf:resource"] !== BOOK_CATEGORY_RDF_RESOURCE_TYPE) {
      return "";
    }
    return rdfDescription["rdf:value"][0];
  });

  return categories.filter(x => !!x);
}
