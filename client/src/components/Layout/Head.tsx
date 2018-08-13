import * as React from "react";
import Helmet from "react-helmet";

interface HeadProps {
  isLandingPage: boolean;
  pageName?: string;
}

export function Head(props: HeadProps) {
  const classes: string[] = [];
  if (props.isLandingPage) {
    classes.push("landing");
  }
  if (props.pageName) {
    classes.push("page");
    classes.push(props.pageName);
  }

  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>My Title</title>
      <link rel="canonical" href="http://mysite.com/example" />
      <body className={classes.join(" ")} />
    </Helmet>
  );
}
