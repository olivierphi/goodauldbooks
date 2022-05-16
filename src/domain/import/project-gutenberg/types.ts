import type { BookAsset } from "../../types"

export type BookToParse = {
    pgBookId: number
    rdfContent: string
    assets: BookAsset[]
    hasIntro: boolean
    hasCover: boolean
    intro: string | null
}
