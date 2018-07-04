import * as React from "react";
import Helmet from "react-helmet";

interface HeadProps {
  isLandingPage: boolean;
}

export function Head(props: HeadProps) {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>My Title</title>
      <link rel="canonical" href="http://mysite.com/example" />
      <body className={props.isLandingPage ? "landing" : ""} />
    </Helmet>
  );
}
