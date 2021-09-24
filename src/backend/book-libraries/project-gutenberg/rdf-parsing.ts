import { DOMParser, Node } from "xmldom";
import * as xpath from "xpath";
import type { BookToParse } from "./domain";
import type { Book, Author } from "../../../domain";
import { PROVIDER_CODE } from "./consts";

const RDF_ABOUT_PATTERN = /^ebooks\/(\d+)$/;
const RDF_AGENT_PATTERN = /^\d+\/agents\/(\d+)$/;

export function parseGutenbergRdf(rdfContent: string): Book {
    const doc = new DOMParser().parseFromString(rdfContent);
    const select = xpath.useNamespaces({
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        dcterms: "http://purl.org/dc/terms/",
        pgterms: "http://www.gutenberg.org/2009/pgterms/",
    });

    const bookTitle = getStringFromXml(select, "//dcterms:title/text()", doc);
    if (!bookTitle) {
        return null;
    }
    const bookId = getStringFromXml(select, "/rdf:RDF/pgterms:ebook/@rdf:about", doc).replace(RDF_ABOUT_PATTERN, "$1");
    const bookLang = getStringFromXml(select, "//dcterms:language/rdf:Description/rdf:value/text()", doc);
    const bookGenres = getStringsFromXml(select, "//dcterms:subject/rdf:Description/rdf:value/text()", doc);
    const authorsNodes = select("//dcterms:creator", doc) as Node[];
    if (authorsNodes.length > 1) {
        console.warn(`multiple authors spotted: check implementation with book ${bookId}`);
    }
    const authors = authorsNodes.map((node) => parseAuthor(select, node)).filter((auth) => !!auth);

    return {
        id: bookId,
        provider: PROVIDER_CODE,
        lang: bookLang,
        title: bookTitle,
        genres: bookGenres,
        assets: [],
        authors,
    };
}

function parseAuthor(select: xpath.XPathSelect, authorNode: Node): Author | null {
    // // Using the authorNode itself as bases of our XPath expressions doesn't work,
    // // we have to create new DOM documents for every author node. :-/
    // const authorNodeDoc = new DOMParser().parseFromString(authorNode.toString());

    const rawAuthorId = getStringFromXml(select, ".//pgterms:agent/@rdf:about", authorNode);

    if (!rawAuthorId) {
        return null;
    }
    const authorId = (rawAuthorId as string).replace(RDF_AGENT_PATTERN, "$1");

    const authorName = getStringFromXml(select, ".//pgterms:agent/pgterms:name/text()", authorNode);
    const [authorFirstName, authorLastName] = getAuthorFirstAndLastNames(authorName);

    const authorBirthYear = getStringFromXml(select, ".//pgterms:agent/pgterms:birthdate/text()", authorNode);
    const authorDeathYear = getStringFromXml(select, ".//pgterms:agent/pgterms:deathdate/text()", authorNode);

    return {
        id: authorId,
        provider: PROVIDER_CODE,
        firstName: authorFirstName,
        lastName: authorLastName,
        birthYear: authorBirthYear ? parseInt(authorBirthYear, 10) : null,
        deathYear: authorDeathYear ? parseInt(authorDeathYear, 10) : null,
    };
}

function getStringsFromXml(select: xpath.XPathSelect, xpathExpression: string, doc: Node): string[] {
    const targetNodes = select(xpathExpression, doc) as Node[] | undefined;
    if (!targetNodes || !Array.isArray(targetNodes) || !targetNodes[0] || !targetNodes[0].nodeValue) {
        return [];
    }

    return targetNodes.map((node) => node.nodeValue);
}

function getStringFromXml(select: xpath.XPathSelect, xpathExpression: string, doc: Node): string | undefined {
    return getStringsFromXml(select, xpathExpression, doc)?.[0];
}

function getAuthorFirstAndLastNames(authorName: string): [string | null, string | null] {
    let firstName: string | null = null;
    let lastName: string | null = null;

    if (authorName) {
        let authorNameArray = authorName.split(",");
        if (authorNameArray.length === 1) {
            // Try again, but with a space this time
            authorNameArray = authorName.split(" ");
        }
        if (authorNameArray.length === 2) {
            firstName = authorNameArray[1].trim();
            lastName = authorNameArray[0].trim();
        } else if (authorNameArray.length === 1) {
            lastName = authorNameArray[0].trim();
        }
    }

    return [firstName, lastName];
}
