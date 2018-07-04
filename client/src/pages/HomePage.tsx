import * as React from "react";
import { InjectedTranslateProps, translate } from "react-i18next";
import { Head } from "../components/Layout/Head";
import { BooksLangContext } from "../contexts/books-lang";
import { HigherOrderComponentToolkitContext } from "../contexts/hoc-toolkit";
import { Lang } from "../domain/core";
import { FeaturedBooksContainer } from "../hoc/Book/FeaturedBooksContainer";
import { HigherOrderComponentToolkit } from "../hoc/HigherOrderComponentToolkit";

function TranslatableHomePage(props: InjectedTranslateProps) {
  return (
    <>
      <Head isLandingPage={true} />
      <section>
        <h1>{props.t("page.homepage.title")}</h1>
        <HigherOrderComponentToolkitContext.Consumer>
          {(hocToolkit: HigherOrderComponentToolkit) => (
            <BooksLangContext.Consumer>
              {(currentBooksLang: Lang) => (
                <FeaturedBooksContainer
                  currentBooksLang={currentBooksLang}
                  hocToolkit={hocToolkit}
                />
              )}
            </BooksLangContext.Consumer>
          )}
        </HigherOrderComponentToolkitContext.Consumer>;
      </section>
    </>
  );
}

export const HomePage = translate()(TranslatableHomePage);
