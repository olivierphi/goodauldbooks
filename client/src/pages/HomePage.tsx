import * as React from "react";
import { InjectedTranslateProps, translate } from "react-i18next";
import { FeaturedBooksContainer } from "../hoc/Book/FeaturedBooksContainer";

function TranslatableHomePage(props: InjectedTranslateProps) {
  return (
    <section>
      <h1>{props.t("page.homepage.title")}</h1>
      <FeaturedBooksContainer />
    </section>
  );
}

export const HomePage = translate()(TranslatableHomePage);
