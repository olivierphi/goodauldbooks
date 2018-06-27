// tslint:disable-next-line:no-implicit-dependencies
import { json } from "data/books-langs.json";
import { BookLangData, BooksLanguagesRepository } from "domain/queries";

export class BooksLanguagesGeneratedJsonRepository implements BooksLanguagesRepository {
  public getAllLangs(): BookLangData[] {
    return getBooksLangesCache();
  }
}

const booksLangsCache: BookLangData[] = [];
function getBooksLangesCache(): BookLangData[] {
  if (0 === booksLangsCache.length) {
    for (const langData of json) {
      booksLangsCache.push({ lang: langData.lang, nbBooks: parseInt(langData.nb, 10) });
    }
  }
  return booksLangsCache;
}
