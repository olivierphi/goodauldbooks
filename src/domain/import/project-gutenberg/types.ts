import type { BookAsset } from "../../types.ts"

export type BookToParse = {
    pgBookId: number
    rdfContent: string
    assets: BookAsset[]
    hasIntro: boolean
    hasCover: boolean
    intro: string | null
}
