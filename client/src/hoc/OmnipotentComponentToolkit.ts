import { ServicesLocator } from "domain/services";
import { HigherOrderComponentToolkit } from "./HigherOrderComponentToolkit";

export interface OmniponentComponentToolkit extends HigherOrderComponentToolkit {
  servicesLocator: ServicesLocator;
}
