import * as React from "react";
import { Banner } from "./Layout/Banner";
import { Head } from "./Layout/Head";
import { Main } from "./Main";

export function Layout(): JSX.Element {
  return (
    <>
      <Head />
      <div id="page-wrapper">
        {/*<Header />*/}
        <Banner />
        <Main />
      </div>
    </>
  );
}
