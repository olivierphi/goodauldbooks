import { BookLangData } from "domain/queries";
import * as React from "react";
import { Option } from "react-select";

export interface BooksLangsSelectorProps {
  booksLangs: BookLangData[];
  currentLang: string;
  onLangChange: (lang: string) => void;
}

export function BooksLangsSelector(props: BooksLangsSelectorProps) {
  const onLangChange = (e: React.ChangeEvent<Option>): void => {
    props.onLangChange(`${e.target.value}`);
  };

  return (
    <select className="books-langs-selector" onChange={onLangChange} value={props.currentLang}>
      <option value="all">ALL</option>
      {props.booksLangs.map((bookLang: BookLangData) => {
        return (
          <option key={bookLang.lang} value={bookLang.lang}>
            {bookLang.lang} - {bookLang.nbBooks}
          </option>
        );
      })}
    </select>
  );
}
