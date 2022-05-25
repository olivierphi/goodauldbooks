import type { BookAsset } from "../../library/types.ts"

export type BookToParse = {
    pgBookId: number
    rdfContent: string
    assets: BookAsset[]
    hasIntro: boolean
    hasCover: boolean
    intro: string | null
}
