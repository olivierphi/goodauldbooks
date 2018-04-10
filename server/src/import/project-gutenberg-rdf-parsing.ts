import * as traverse from "traverse";
import { Author } from "../domain/import";

/**
 * I could have used XPath and stuff like that, but I really dislike XML parsing, so why not
 * converting all the XML data into a big object and then retrive its data via Traverser?
 * Probably not the most efficient way to do it, sure, but this should do the job for the moment ^_^
 */

const BOOK_CATEGORY_RDF_RESOURCE_TYPE = "http://purl.org/dc/terms/LCSH";

export function getProjectGutenbergId(rdfTraverser: traverse.Traverse<{}>): number {
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

export function getPublisher(rdfTraverser: traverse.Traverse<{}>): string {
  return rdfTraverser.get(["rdf:RDF", "pgterms:ebook", "0", "dcterms:publisher", "0"]);
}

export function getTitle(rdfTraverser: traverse.Traverse<{}>): string {
  return rdfTraverser.get(["rdf:RDF", "pgterms:ebook", "0", "dcterms:title", "0"]);
}

export function getLanguage(rdfTraverser: traverse.Traverse<{}>): string {
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

export function getAuthor(rdfTraverser: traverse.Traverse<{}>): Author {
  const authorRaw: any = rdfTraverser.get([
    "rdf:RDF",
    "pgterms:ebook",
    "0",
    "dcterms:creator",
    "0",
    "pgterms:agent",
    "0",
  ]);

  const projectGutenbergAgentStr: string = authorRaw.$["rdf:about"];
  const birthYearStr: string = authorRaw["pgterms:birthdate"]["0"]._;
  const deathYearStr: string = authorRaw["pgterms:deathdate"]["0"]._;
  const wikipediaUrl: string = authorRaw["pgterms:webpage"]["0"].$["rdf:resource"];
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
    birthYear: parseInt(birthYearStr, 10),
    deathYear: deathYearStr ? parseInt(deathYearStr, 10) : null,
  };
}

export function getGenres(rdfTraverser: traverse.Traverse<{}>): string[] {
  const categoriesRaw: Array<{}> = rdfTraverser.get([
    "rdf:RDF",
    "pgterms:ebook",
    "0",
    "dcterms:subject",
  ]);

  const categories = categoriesRaw.map((dcTermsSubjectData: any): string => {
    const rdfDescription = dcTermsSubjectData["rdf:Description"][0];
    if (rdfDescription["dcam:memberOf"][0].$["rdf:resource"] !== BOOK_CATEGORY_RDF_RESOURCE_TYPE) {
      return "";
    }
    return rdfDescription["rdf:value"][0];
  });

  return categories.filter(x => !!x);
}
