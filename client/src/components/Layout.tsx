import * as React from "react";
import { AutocompleteSearchContainer } from "../hoc/AutocompleteSearchContainer";
import { Header } from "./Header";
import { Main } from "./Main";

export function Layout(): JSX.Element {
  return (
    <>
      <Header />
      <AutocompleteSearchContainer />
      <Main />
    </>
  );
}
