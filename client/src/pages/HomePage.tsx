import * as React from "react";
import { InjectedTranslateProps, translate } from "react-i18next";
import { BooksLangContext } from "../contexts/books-lang";
import { Lang } from "../domain/core";
import { FeaturedBooksContainer } from "../hoc/Book/FeaturedBooksContainer";

function TranslatableHomePage(props: InjectedTranslateProps) {
  return (
    <section>
      <h1>{props.t("page.homepage.title")}</h1>
      <BooksLangContext.Consumer>
        {(currentBooksLang: Lang) => <FeaturedBooksContainer currentBooksLang={currentBooksLang} />}
      </BooksLangContext.Consumer>
    </section>
  );
}

export const HomePage = translate()(TranslatableHomePage);
