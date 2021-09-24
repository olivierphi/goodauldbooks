import * as path from "path";
import * as fs from "fs/promises";
import { parseGutenbergRdf } from "./rdf-parsing";
import type { Book } from "../../../domain";

test("it can parse a Project Gutenberg RDF file", async () => {
    const rdfFilePath = path.join(__dirname, "../../../../test/data/project-gutenberg/345-dracula/pg345.rdf");
    const rdfContent = await fs.readFile(rdfFilePath, {
        encoding: "utf8",
    });
    const bookData = parseGutenbergRdf(rdfContent);

    const expectedBookData: Book = {
        id: "345",
        provider: "pg",
        lang: "en",
        title: "Dracula",
        genres: [
            "Epistolary fiction",
            "Dracula, Count (Fictitious character) -- Fiction",
            "Gothic fiction",
            "Horror tales",
            "Vampires -- Fiction",
            "Transylvania (Romania) -- Fiction",
            "Whitby (England) -- Fiction",
            "PR",
        ],
        assets: [],
        authors: [
            { id: "190", firstName: "Bram", lastName: "Stoker", birthYear: 1847, deathYear: 1912, provider: "pg" },
        ],
    };
    expect(bookData).toEqual(expectedBookData);
});
