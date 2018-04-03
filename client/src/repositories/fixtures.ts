import { Book } from "../domain/core";

export const books: Book[] = [
  {
    gutenbergId: 345,
    id: "dracula-bram-stoker",
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
    id: "the-troll-garden-and-selected-stories-willa-catherova",
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
