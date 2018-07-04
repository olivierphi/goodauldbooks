import * as React from "react";
import { Banner } from "./Layout/Banner";
import { Main } from "./Main";

export function Layout(): JSX.Element {
  return (
    <>
      <div id="page-wrapper">
        <Banner />
        <Main />
      </div>
    </>
  );
}
