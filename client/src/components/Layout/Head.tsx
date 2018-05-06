import * as React from "react";
import Helmet from "react-helmet";

export function Head() {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>My Title</title>
      <link rel="canonical" href="http://mysite.com/example" />
      <body className="landing" />
    </Helmet>
  );
}
