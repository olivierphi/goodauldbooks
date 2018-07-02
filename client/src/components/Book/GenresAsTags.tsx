import * as React from "react";
import { Link } from "react-router-dom";
import { GenreWithStats, Lang, LANG_ALL } from "../../domain/core";
import { getGenrePageUrl } from "../../utils/routing-utils";

export interface GenresAsTagsProps {
  currentBooksLang: Lang;
  genresWithStats: GenreWithStats[];
}

export function GenresAsTags(props: GenresAsTagsProps) {
  return (
    <ul className="genres tags field is-grouped is-grouped-multiline">
      {props.genresWithStats.map((genre: GenreWithStats, i) => {
        return (
          <li key={i} className="control">
            <div className="tags has-addons">
              <span className="tag is-dark">
                <Link to={getGenrePageUrl(genre.title)}>{genre.title}</Link>
              </span>
              <span className="tag is-info">
                {LANG_ALL === props.currentBooksLang
                  ? genre.nbBooks
                  : genre.nbBooksByLang[props.currentBooksLang] || 0}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
