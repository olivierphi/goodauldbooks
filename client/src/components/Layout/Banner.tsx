import { LANG_ALL } from "domain/core";
import * as React from "react";
import { InjectedTranslateProps, translate } from "react-i18next";
import { Link } from "react-router-dom";
import { OmnipotentComponentToolkitContext } from "../../contexts/omnipotent-component-toolkit";
import { AutocompleteSearchContainer } from "../../hoc/AutocompleteSearchContainer";
import { BooksLangsSelectorContainer } from "../../hoc/Misc/BooksLangsSelectorContainer";
import { OmniponentComponentToolkit } from "../../hoc/OmnipotentComponentToolkit";

interface BannerProps extends InjectedTranslateProps {
  currentBooksLang: string;
  nbBooks: number;
}

// TODO: i18n
function TranslatableBanner(props: BannerProps) {
  const currentLang: string = props.t(`lang.${props.currentBooksLang}`);

  return (
    <section id="banner">
      <h1>
        <Link to={`/${props.currentBooksLang}`}>Good Auld Books</Link>
      </h1>
      <p>Find a book amongst a collection of {props.nbBooks} by using the search field below</p>
      <OmnipotentComponentToolkitContext.Consumer>
        {(omnipotentToolkit: OmniponentComponentToolkit) => (
          <>
            <div className="search-container">
              <AutocompleteSearchContainer hocToolkit={omnipotentToolkit} />
            </div>
            <div className="books-langs-selector-container">
              <span className="current-books-language">
                {props.currentBooksLang === LANG_ALL ? (
                  <span>
                    Browing books in <span className="language">all available</span> languages
                  </span>
                ) : (
                  <span>
                    Browing books for language <span className="language">"{currentLang}"</span>{" "}
                    only
                  </span>
                )}
              </span>
              <span className="books-language-change-caption">
                {props.currentBooksLang === LANG_ALL ? (
                  <span>You can narrow the books we show you to a specific language here:</span>
                ) : (
                  <span>You can change the books language we show you here:</span>
                )}
              </span>
              <BooksLangsSelectorContainer hocToolkit={omnipotentToolkit} />
            </div>
          </>
        )}
      </OmnipotentComponentToolkitContext.Consumer>
    </section>
  );
}

export const Banner = translate()(TranslatableBanner);
