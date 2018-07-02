import * as React from "react";
import { InjectedTranslateProps, translate } from "react-i18next";
import { BooksLangContext } from "../contexts/books-lang";
import { HigherOrderComponentToolboxContext } from "../contexts/hoc-toolbox";
import { Lang } from "../domain/core";
import { FeaturedBooksContainer } from "../hoc/Book/FeaturedBooksContainer";
import { HigherOrderComponentToolbox } from "../hoc/HigherOrderComponentToolbox";

function TranslatableHomePage(props: InjectedTranslateProps) {
  return (
    <section>
      <h1>{props.t("page.homepage.title")}</h1>
      <HigherOrderComponentToolboxContext.Consumer>
        {(hocToolbox: HigherOrderComponentToolbox) => (
          <BooksLangContext.Consumer>
            {(currentBooksLang: Lang) => (
              <FeaturedBooksContainer currentBooksLang={currentBooksLang} hocToolbox={hocToolbox} />
            )}
          </BooksLangContext.Consumer>
        )}
      </HigherOrderComponentToolboxContext.Consumer>;
    </section>
  );
}

export const HomePage = translate()(TranslatableHomePage);
