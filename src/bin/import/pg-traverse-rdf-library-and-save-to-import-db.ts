import { traverseGeneratedCollectionDirectoryAndSaveToImportDb } from "../../domain/import/project-gutenberg/commands/traverse-rdf-library-and-save-to-import-db"

async function runScript(): Promise<void> {
    if (process.argv.length < 3) {
        console.error("Mandatory Project Gutenberg 'generated' collection directory path argument missing.")
        process.exit(1)
    }
    const collectionPath = process.argv[2]
    await traverseGeneratedCollectionDirectoryAndSaveToImportDb({ collectionPath })
}

runScript().then(
    () => {
        console.log("Success!")
    },
    (err) => console.error("An error occurred:", err)
)
