import * as React from "react";
import { Banner } from "./Layout/Banner";
import { Footer } from "./Layout/Footer";
import { Main } from "./Main";

export function Layout(): JSX.Element {
  return (
    <>
      <div id="page-wrapper">
        <Banner />
        <Main />
      </div>
      <Footer />
    </>
  );
}
