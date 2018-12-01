import { Author, Book } from "@goodauldbooks/library/domain";
import { dirname, join } from "path";
import { DOMParser } from "xmldom";
import * as xpath from "xpath";
import { fs as fsAsync } from "../utils/async-utils";
import { BookToParse, PROVIDER_CODE } from "./domain";

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

export function parseBook(bookToParse: BookToParse): Book | null {
  const doc = new DOMParser().parseFromString(bookToParse.rdfContent);
  const select = xpath.useNamespaces({
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    dcterms: "http://purl.org/dc/terms/",
    pgterms: "http://www.gutenberg.org/2009/pgterms/",
  });
  const bookTitle = getStringFromXml(select, "//dcterms:title/text()", doc);
  if (!bookTitle) {
    return null;
  }
  const bookId = (getStringFromXml(
    select,
    "/rdf:RDF/pgterms:ebook/@rdf:about",
    doc
  ) as string).replace(/^ebooks\/(\d+)$/, "$1");
  const bookLang = getStringFromXml(
    select,
    "//dcterms:language/rdf:Description/rdf:value/text()",
    doc
  );
  const bookGenres = getStringsFromXml(
    select,
    "//dcterms:subject/rdf:Description/rdf:value/text()",
    doc
  );
  const authorsNodes = select("//dcterms:creator", doc) as Node[];
  // if (authorsNodes.length > 1) {
  //   console.warn(`multiple authors spotted: check implementation with book ${bookId}`);
  // }
  const authors = authorsNodes
    .map(parseAuthor.bind(null, select))
    .filter(auth => !!auth) as Author[];

  return {
    id: bookId,
    provider: PROVIDER_CODE,
    lang: bookLang as string,
    title: bookTitle,
    genres: bookGenres,
    assets: [],
    authors,
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

function getStringFromXml(
  select: xpath.XPathSelect,
  xpathExpression: string,
  doc: Node
): string | null {
  const targetNode = select(xpathExpression, doc);
  if (
    !targetNode ||
    !Array.isArray(targetNode) ||
    !targetNode[0] ||
    !(targetNode[0] as Node).nodeValue
  ) {
    return null;
  }
  return (targetNode[0] as Node).nodeValue as string;
}

function getStringsFromXml(
  select: xpath.XPathSelect,
  xpathExpression: string,
  doc: Node
): string[] {
  const targetNodes = select(xpathExpression, doc);
  if (
    !targetNodes ||
    !Array.isArray(targetNodes) ||
    !targetNodes[0] ||
    !(targetNodes[0] as Node).nodeValue
  ) {
    return [];
  }
  return (targetNodes as Node[]).map(node => {
    return node.nodeValue as string;
  });
}

function parseAuthor(select: xpath.XPathSelect, authorNode: Node): Author | null {
  // Using the authorNode itself as bases of our XPath expressions doesn't work,
  // we have to create new DOM documents for every author node. :-/
  const authorNodeDoc = new DOMParser().parseFromString(authorNode.toString());

  const rawAuthorId = getStringFromXml(select, "//pgterms:agent/@rdf:about", authorNodeDoc);

  if (!rawAuthorId) {
    return null;
  }
  const authorId = (rawAuthorId as string).replace(/^\d+\/agents\/(\d+)$/, "$1");

  const authorName = getStringFromXml(select, "//pgterms:agent/pgterms:name/text()", authorNodeDoc);
  let authorFirstName: string | null = null;
  let authorLastName: string | null = null;
  if (authorName) {
    let authorNameArray = authorName.split(",");
    if (authorNameArray.length === 1) {
      // Try again, but with a space this time
      authorNameArray = authorName.split(" ");
    }
    if (authorNameArray.length === 2) {
      authorFirstName = authorNameArray[1].trim();
      authorLastName = authorNameArray[0].trim();
    } else if (authorNameArray.length === 1) {
      authorLastName = authorNameArray[0].trim();
    }
  }
  const authorBirthYear = getStringFromXml(
    select,
    "//pgterms:agent/pgterms:birthdate/text()",
    authorNodeDoc
  );
  const authorDeathYear = getStringFromXml(
    select,
    "//pgterms:agent/pgterms:deathdate/text()",
    authorNodeDoc
  );

  return {
    id: authorId,
    provider: PROVIDER_CODE,
    firstName: authorFirstName,
    lastName: authorLastName,
    birthYear: authorBirthYear ? parseInt(authorBirthYear, 10) : null,
    deathYear: authorDeathYear ? parseInt(authorDeathYear, 10) : null,
  };
}
