export type BookAssetType = "cover" | "epub" | "mobi" | "txt"

export type BookAsset = {
    type: BookAssetType
    size: number
}

export type Author = {
    provider: string
    id: string
    firstName: string | null
    lastName: string | null
    birthYear: number | null
    deathYear: number | null
}

export type Book = {
    provider: string
    id: string
    title: string
    lang: string
    genres: string[]
    assets: BookAsset[]
    authors: Author[]
}
