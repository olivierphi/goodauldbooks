import { BookLangData } from "domain/queries";
import * as React from "react";
import { InjectedTranslateProps, translate } from "react-i18next";
import { Option } from "react-select";

export interface BooksLangsSelectorProps extends InjectedTranslateProps {
  currentBooksLang: string;
  availableBooksLangs: BookLangData[];
  onLangChange: (lang: string) => void;
}

function TranslatableBooksLangsSelector(props: BooksLangsSelectorProps) {
  const onLangChange = (e: React.ChangeEvent<Option>): void => {
    props.onLangChange(`${e.target.value}`);
  };

  return (
    <select className="books-langs-selector" onChange={onLangChange} value={props.currentBooksLang}>
      {props.availableBooksLangs.map((bookLang: BookLangData) => {
        return (
          <option key={bookLang.lang} value={bookLang.lang}>
            {props.t(`lang.${bookLang.lang}`)} - {bookLang.nbBooks} books
          </option>
        );
      })}
    </select>
  );
}

export const BooksLangsSelector = translate()(TranslatableBooksLangsSelector);
