import * as React from "react";
import { OmniponentComponentToolkit } from "../hoc/OmnipotentComponentToolkit";

/**
 * /!\ With great power comes you-know-what
 */
export const OmnipotentComponentToolkitContext = React.createContext<OmniponentComponentToolkit | null>(
  null
);
