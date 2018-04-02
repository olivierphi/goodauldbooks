import { Book } from "../domain";

export const Books: Book[] = [
  {
    gutenbergId: 345,
    id: "4e35570a-4584-4129-a9af-c1347950c626",
    author: {
      firstName: "Bram",
      lastName: "Stoker",
      birthYear: 1847,
      deathYear: 1912,
    },
    title: { en: "Dracula" },
    genres: [
      { name: { en: "Epistolary fiction" } },
      { name: { en: "Gothic fiction" } },
    ],
  },
  {
    gutenbergId: 346,
    id: "60264500-b110-5ad3-b487-5e4602f23095",
    author: {
      firstName: "Willa",
      lastName: "Catherová",
      birthYear: 1873,
      deathYear: 1947,
    },
    title: { en: "The Troll Garden, and Selected Stories" },
    genres: [
      { name: { en: "Man-woman relationships" } },
      { name: { en: "Social life and customs" } },
      { name: { en: "Nebraska" } },
    ],
  },
];
