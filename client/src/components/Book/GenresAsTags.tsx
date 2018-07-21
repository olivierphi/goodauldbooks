import * as React from "react";
import { Link } from "react-router-dom";
import { BooksLangContext } from "../../contexts/books-lang";
import { GenreWithStats, Lang, LANG_ALL } from "../../domain/core";
import { getGenrePageUrl } from "../../utils/routing-utils";

export interface GenresAsTagsProps {
  currentBooksLang: Lang;
  genresWithStats: GenreWithStats[];
}

// TODO: i18n
export function GenresAsTags(props: GenresAsTagsProps) {
  const getNbBooksToDisplay = (genre: GenreWithStats): number => {
    return LANG_ALL === props.currentBooksLang
      ? genre.nbBooks
      : genre.nbBooksByLang[props.currentBooksLang] || 0;
  };

  return (
    <BooksLangContext.Consumer>
      {(currentBooksLang: Lang) => (
        <div className="tags-container">
          <h6>This book belong to the following literary genres:</h6>

          <ul className="genres tags">
            {props.genresWithStats.map((genre: GenreWithStats, i) => {
              return (
                <li key={i}>
                  <div className="tag">
                    <span className="tag-main-content">
                      <Link to={getGenrePageUrl(currentBooksLang, genre.title)}>{genre.title}</Link>
                    </span>
                    <span className="tag-side-content">{getNbBooksToDisplay(genre)} books</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </BooksLangContext.Consumer>
  );
}
