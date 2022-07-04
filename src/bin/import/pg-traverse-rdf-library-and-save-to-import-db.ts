import { traverseGeneratedCollectionDirectoryAndSaveToImportDb } from "../../domain/import/project-gutenberg/commands/traverse-rdf-library-and-save-to-import-db.ts"

async function runScript(): Promise<void> {
    if (process.argv.length < 3) {
        console.error("Mandatory Project Gutenberg 'generated' collection directory path argument missing.")
        process.exit(1)
    }
    const collectionPath = process.argv[2]
    console.log(`Starting traversal of Project Gutenberg generated collection in "${collectionPath}"...`)
    await traverseGeneratedCollectionDirectoryAndSaveToImportDb({ collectionPath, onRdfCallback })
    console.log("")
}

let booksCounter = 0
const onRdfCallback = async (_rdfFilePath: string, _pgBookId: number) => {
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
