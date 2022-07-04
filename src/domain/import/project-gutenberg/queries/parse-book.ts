import { DOMParser } from "xmldom"
import * as xpath from "xpath"
import type { Author, Book } from "../../../library/types.ts"
import { PROVIDER_CODE } from "../constants.ts"
import { BookToParse } from "../types.ts"

const parser = new DOMParser()

type ParseBookArgs = {
    bookToParse: BookToParse
}

export function parseBook({ bookToParse }: ParseBookArgs): Book | null {
    const doc = parser.parseFromString(bookToParse.rdfContent)
    const select = xpath.useNamespaces({
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        dcterms: "http://purl.org/dc/terms/",
        pgterms: "http://www.gutenberg.org/2009/pgterms/",
    })
    const bookTitle = getStringFromXml(select, "//dcterms:title/text()", doc)
    if (!bookTitle) {
        return null
    }
    const bookId = (getStringFromXml(select, "/rdf:RDF/pgterms:ebook/@rdf:about", doc) as string).replace(
        /^ebooks\/(\d+)$/,
        "$1"
    )
    const bookLang = getStringFromXml(select, "//dcterms:language/rdf:Description/rdf:value/text()", doc)
    const bookGenres = getStringsFromXml(select, "//dcterms:subject/rdf:Description/rdf:value/text()", doc)
    const authorsNodes = select("//dcterms:creator", doc) as Node[]
    if (authorsNodes.length > 1) {
        console.warn(`multiple authors spotted: check implementation with book ${bookId}`)
    }
    const authors = authorsNodes.map(parseAuthor.bind(null, select)).filter((auth) => !!auth) as Author[]

    return {
        id: bookId,
        provider: PROVIDER_CODE,
        publicId: `${PROVIDER_CODE}:${bookId}`,
        lang: bookLang as string,
        title: bookTitle,
        genres: bookGenres,
        assets: bookToParse.assets,
        authors,
    }
}

function getStringFromXml(select: xpath.XPathSelect, xpathExpression: string, doc: Node): string | null {
    const targetNode = select(xpathExpression, doc)
    if (!targetNode || !Array.isArray(targetNode) || !targetNode[0] || !(targetNode[0] as Node).nodeValue) {
        return null
    }
    return (targetNode[0] as Node).nodeValue as string
}

function getStringsFromXml(select: xpath.XPathSelect, xpathExpression: string, doc: Node): string[] {
    const targetNodes = select(xpathExpression, doc)
    if (!targetNodes || !Array.isArray(targetNodes) || !targetNodes[0] || !(targetNodes[0] as Node).nodeValue) {
        return []
    }
    return (targetNodes as Node[]).map((node) => {
        return node.nodeValue as string
    })
}

function parseAuthor(select: xpath.XPathSelect, authorNode: Node): Author | null {
    const rawAuthorId = getStringFromXml(select, ".//pgterms:agent/@rdf:about", authorNode)

    if (!rawAuthorId) {
        return null
    }
    const authorId = (rawAuthorId as string).replace(/^\d+\/agents\/(\d+)$/, "$1")

    const authorName = getStringFromXml(select, ".//pgterms:agent/pgterms:name/text()", authorNode)
    let authorFirstName: string | null = null
    let authorLastName: string | null = null
    if (authorName) {
        let authorNameArray = authorName.split(",")
        if (authorNameArray.length === 1) {
            // Try again, but with a space this time
            authorNameArray = authorName.split(" ")
        }
        if (authorNameArray.length === 2) {
            authorFirstName = authorNameArray[1].trim()
            authorLastName = authorNameArray[0].trim()
        } else if (authorNameArray.length === 1) {
            authorLastName = authorNameArray[0].trim()
        }
    }
    const authorBirthYear = getStringFromXml(select, ".//pgterms:agent/pgterms:birthdate/text()", authorNode)
    const authorDeathYear = getStringFromXml(select, ".//pgterms:agent/pgterms:deathdate/text()", authorNode)

    return {
        id: authorId,
        provider: PROVIDER_CODE,
        publicId: `${PROVIDER_CODE}:${authorId}`,
        firstName: authorFirstName,
        lastName: authorLastName,
        birthYear: authorBirthYear ? parseInt(authorBirthYear, 10) : null,
        deathYear: authorDeathYear ? parseInt(authorDeathYear, 10) : null,
    }
}
