import {Book, Lang} from "../domain/core";

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
    title: new Map([[Lang.EN, "Dracula"]]),
    genres: [
      { name: new Map([[Lang.EN, "Epistolary fiction"]]) },
      { name: new Map([[Lang.EN, "Gothic fiction"]]) },
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
    title: new Map([[Lang.EN, "The Troll Garden, and Selected Stories"]]),
    genres: [
      { name: new Map([[Lang.EN, "Man-woman relationships"]]) },
      { name: new Map([[Lang.EN, "Social life and customs"]]) },
      { name: new Map([[Lang.EN, "Nebraska"]]) },
    ],
  },
];
