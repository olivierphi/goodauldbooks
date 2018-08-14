import * as React from "react";
import { InjectedTranslateProps, translate } from "react-i18next";
import { Link } from "react-router-dom";
import { BooksLangContext } from "../../contexts/books-lang";
import { GenreWithStats, Lang, LANG_ALL } from "../../domain/core";
import { getGenrePageUrl } from "../../utils/routing-utils";

export interface GenresAsTagsProps extends InjectedTranslateProps {
  currentBooksLang: Lang;
  genresWithStats: GenreWithStats[];
}

// TODO: i18n
function TranslatableGenresAsTags(props: GenresAsTagsProps) {
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

          {LANG_ALL === props.currentBooksLang ? (
            ""
          ) : (
            <p className="nb-books-explanation">
              (The number of books displayed is narrowed to the books we have in{" "}
              <span className="language">{props.t(`lang.${currentBooksLang}`)}</span>)
            </p>
          )}

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

export const GenresAsTags = translate()(TranslatableGenresAsTags);
