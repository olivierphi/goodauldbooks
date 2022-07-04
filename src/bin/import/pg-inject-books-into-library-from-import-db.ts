import { injectBooksIntoLibraryFromImportDb } from "../../domain/import/project-gutenberg/commands/inject-books-into-library-from-import-db"
import type { Book } from "../../domain/library/types.ts"

async function runScript(): Promise<void> {
    await injectBooksIntoLibraryFromImportDb({ onParsedBookCallback })
    console.log("")
}

let booksCounter = 0
const onParsedBookCallback = (_book: Book): void => {
    process.stdout.write(".")
    booksCounter++
    if (booksCounter % 80 === 0) {
        process.stdout.write("\n")
    }
}

export default {}

runScript().then(
    () => {
        console.log("Success!")
    },
    (err) => console.error("An error occurred:", err)
)
