import { dirname, join } from "node:path"
import fs from "node:fs/promises"
import type { BookToParse } from "../types"
import type { BookAsset, BookAssetType } from "../../../types"
import { BOOK_ASSETS_FILES_TYPES } from "../constants"

// /!\ This is a length in bytes, not in chars.
// But we take the intro in a very vague way anyhow... :-)
const BOOK_INTRO_LENGTH = 5000

type ParseBookFromRdfArgs = {
    pgBookId: number
    rdfFilePath: string
}

export async function parseBookFromRdf({ pgBookId, rdfFilePath }: ParseBookFromRdfArgs): Promise<BookToParse> {
    const bookFolderPath = dirname(rdfFilePath)
    const rdfContent = await getBookRdfFileContent(rdfFilePath)

    const assets = await getBookAssets(bookFolderPath)

    const introFilePath = join(bookFolderPath, `pg${pgBookId}.txt.utf8`)
    const intro = await getBookIntro(introFilePath)
    const hasIntro = intro !== null

    const coverFilePath = join(bookFolderPath, `pg${pgBookId}.cover.medium.jpg`)
    let hasCover = true
    try {
        await fs.access(coverFilePath)
    } catch (e) {
        hasCover = false
    }

    return {
        pgBookId,
        rdfContent,
        assets,
        hasIntro,
        intro,
        hasCover,
    }
}

async function getBookRdfFileContent(rdfFilePath: string): Promise<string> {
    const rdfData = await fs.readFile(rdfFilePath, {
        encoding: "utf8",
    })

    if (!rdfData) {
        return Promise.reject(new Error(`Empty RDF file "${rdfFilePath}"`))
    }

    return rdfData
}

async function getBookAssets(bookFolderPath: string): Promise<BookAsset[]> {
    const filesPathsInThatFolder: string[] = await fs.readdir(bookFolderPath)
    const result = []
    for (const fileName of filesPathsInThatFolder) {
        for (const [assetType, assetRegex] of Object.entries(BOOK_ASSETS_FILES_TYPES)) {
            if (fileName.match(assetRegex)) {
                const fileStats = await fs.stat(join(bookFolderPath, fileName))
                result.push({ type: assetType as BookAssetType, size: fileStats.size })
            }
        }
    }
    return result
}

async function getBookIntro(introFilePath: string): Promise<string | null> {
    let textFile
    try {
        textFile = await fs.open(introFilePath, "r")
    } catch (e) {
        return null
    }
    const textBuffer = Buffer.alloc(BOOK_INTRO_LENGTH)

    await textFile.read(textBuffer, 0, BOOK_INTRO_LENGTH, 0)

    await textFile.close()

    return textBuffer.toString("utf8")
}
