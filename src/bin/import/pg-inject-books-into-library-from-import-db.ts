import { injectBooksIntoLibraryFromImportDb } from "../../domain/import/project-gutenberg/commands/inject-books-into-library-from-import-db"

async function runScript(): Promise<void> {
    await injectBooksIntoLibraryFromImportDb({})
}

export default {}

runScript().then(
    () => {
        console.log("Success!")
    },
    (err) => console.error("An error occurred:", err)
)
