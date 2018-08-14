import * as React from "react";
import { OmnipotentComponentToolkitContext } from "../contexts/omnipotent-component-toolkit";
import { BannerContainer } from "../hoc/Layout/BannerContainer";
import { OmniponentComponentToolkit } from "../hoc/OmnipotentComponentToolkit";
import { Footer } from "./Layout/Footer";
import { Main } from "./Main";

export function Layout(): JSX.Element {
  return (
    <>
      <div id="page-wrapper">
        <OmnipotentComponentToolkitContext.Consumer>
          {(hocToolkit: OmniponentComponentToolkit) => <BannerContainer hocToolkit={hocToolkit} />}
        </OmnipotentComponentToolkitContext.Consumer>
        <Main />
      </div>
      <Footer />
    </>
  );
}
