import * as React from "react";
import { Link } from "react-router-dom";
import { GenreWithStats } from "../../domain/core";
import { getGenrePageUrl } from "../../utils/routing-utils";

export interface GenresAsTagsProps {
  genresWithStats: GenreWithStats[];
}

export function GenresAsTags(props: GenresAsTagsProps) {
  return (
    <ul className="genres tags">
      {props.genresWithStats.map((genre: GenreWithStats, i) => {
        return (
          <li key={i}>
            <Link to={getGenrePageUrl(genre.title)}>
              {genre.title} ({genre.nbBooks} books)
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
