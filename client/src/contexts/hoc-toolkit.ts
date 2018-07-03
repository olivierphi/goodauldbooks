import * as React from "react";
import { HigherOrderComponentToolkit } from "../hoc/HigherOrderComponentToolkit";

export const HigherOrderComponentToolkitContext = React.createContext<HigherOrderComponentToolkit | null>(
  null
);
