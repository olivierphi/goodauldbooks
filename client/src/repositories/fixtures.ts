import { Book, Lang } from "../domain/core";

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
    title: { [Lang.EN]: "Dracula" },
    genres: [
      { name: { [Lang.EN]: "Epistolary fiction" } },
      { name: { [Lang.EN]: "Gothic fiction" } },
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
    title: { [Lang.EN]: "The Troll Garden, and Selected Stories" },
    genres: [
      { name: { [Lang.EN]: "Man-woman relationships" } },
      { name: { [Lang.EN]: "Social life and customs" } },
      { name: { [Lang.EN]: "Nebraska" } },
    ],
  },
];
