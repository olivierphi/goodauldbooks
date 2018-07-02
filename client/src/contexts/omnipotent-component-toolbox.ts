import * as React from "react";
import { OmniponentComponentToolbox } from "../hoc/OmnipotentComponentToolbox";

/**
 * /!\ With great power comes you-know-what
 */
export const OmnipotentComponentToolboxContext = React.createContext<OmniponentComponentToolbox | null>(
  null
);
