import { BookAssetType } from "../../types.ts"

export const PROVIDER_CODE = "pg"

export const RDF_FILES_COLLECTION_GLOB = "**/pg*.rdf"
export const RDF_FILE_REGEX = /pg(\d+)\.rdf$/

export const BOOK_ASSETS_FILES_TYPES: Record<BookAssetType, RegExp> = {
    epub: /^pg\d+-images\.epub$/,
    cover: /^pg\d+\.cover\.medium\.jpg$/,
    mobi: /^pg\d+-images\.mobi$/,
    txt: /^pg\d+\.txt\.utf8$/,
}

export enum EmittedEvents {
    IMPORT_ERROR = "book_import:error",
}
