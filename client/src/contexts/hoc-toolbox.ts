import * as React from "react";
import { HigherOrderComponentToolbox } from "../hoc/HigherOrderComponentToolbox";

export const HigherOrderComponentToolboxContext = React.createContext<HigherOrderComponentToolbox | null>(
  null
);
