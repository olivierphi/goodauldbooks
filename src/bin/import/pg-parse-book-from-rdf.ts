import { parseBookFromRdf } from "../../domain/import/project-gutenberg/queries/parse-book-from-rdf.ts"
import { parseBook } from "../../domain/import/project-gutenberg/queries/parse-book.ts"
import { Book } from "../../domain/types.ts"

async function runScript(): Promise<Book | null> {
    if (process.argv.length < 3) {
        console.error("Mandatory RDF file path argument missing.")
        process.exit(1)
    }
    const rdfFilePath = process.argv[2]
    const pgBookId = parseInt(rdfFilePath.replace(/^.*\/pg(\d+)\.rdf$/, "$1"))
    console.log(`Parsing book '${pgBookId}'...`)
    const bookToParse = await parseBookFromRdf({ pgBookId, rdfFilePath })
    console.log("bookToParse=", {
        ...bookToParse,
        rdfContent: `[${bookToParse.rdfContent.length} chars]`,
        intro: bookToParse.intro ? `[${bookToParse.intro.length} chars]` : null,
    })

    const parsedBook = parseBook({ bookToParse })
    console.log("parsedBook=", parsedBook)
    return parsedBook
}

runScript().then(
    (book) => {
        console.log("Success!")
    },
    (err) => console.error("An error occurred:", err)
)
