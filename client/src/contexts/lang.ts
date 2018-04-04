import * as React from "react";

// React.createcontext is not ready yet in @types/react... :-/

const reactRef: any = React;

export interface Context {
  Provider: any;
  Consumer: any;
}

export const CurrentLangContext: Context = reactRef.createContext();
