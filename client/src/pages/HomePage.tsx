import * as React from "react";
import { InjectedTranslateProps, translate } from "react-i18next";
import { Head } from "../components/Layout/Head";
import { BooksLangContext } from "../contexts/books-lang";
import { HigherOrderComponentToolkitContext } from "../contexts/hoc-toolkit";
import { Lang } from "../domain/core";
import { BreadcrumbData, Page } from "../domain/pages";
import { FeaturedBooksContainer } from "../hoc/Book/FeaturedBooksContainer";
import { HigherOrderComponentToolkit } from "../hoc/HigherOrderComponentToolkit";

class TranslatableHomePage extends React.Component<InjectedTranslateProps> {
  private setBreadcrumb: (breadcrumb: BreadcrumbData) => void | null;

  public render() {
    return (
      <>
        <Head isLandingPage={true} />
        <section>
          <h2 className="page-title">{this.props.t("page.homepage.title")}</h2>
          <HigherOrderComponentToolkitContext.Consumer>
            {(hocToolkit: HigherOrderComponentToolkit) => (
              <>
                {(this.setBreadcrumb = hocToolkit.setBreadcrumb)}
                <BooksLangContext.Consumer>
                  {(currentBooksLang: Lang) => (
                    <FeaturedBooksContainer
                      currentBooksLang={currentBooksLang}
                      hocToolkit={hocToolkit}
                    />
                  )}
                </BooksLangContext.Consumer>
              </>
            )}
          </HigherOrderComponentToolkitContext.Consumer>;
        </section>
      </>
    );
  }

  public componentDidMount() {
    this.setBreadcrumb && this.setBreadcrumb({ currentPage: Page.HOMEPAGE });
  }
}

export const HomePage = translate()(TranslatableHomePage);
