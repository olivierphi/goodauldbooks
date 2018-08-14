import { LANG_ALL } from "domain/core";
import * as React from "react";
import { Banner } from "../../components/Layout/Banner";
import { BookLangData } from "../../domain/queries";
import { OmniponentComponentToolkit } from "../OmnipotentComponentToolkit";

interface BannerContainerProps {
  hocToolkit: OmniponentComponentToolkit;
}

export function BannerContainer(props: BannerContainerProps) {
  const servicesLocator = props.hocToolkit.servicesLocator;
  const nbBooksByLang = servicesLocator.booksLangsRepository.getAllLangs();
  const nbBooksForAllLangs = nbBooksByLang.filter((bookData: BookLangData) => {
    return bookData.lang === LANG_ALL;
  })[0].nbBooks;

  const currentBooksLang = props.hocToolkit.appStateStore.getState().booksLang;

  return <Banner currentBooksLang={currentBooksLang} nbBooks={nbBooksForAllLangs} />;
}
