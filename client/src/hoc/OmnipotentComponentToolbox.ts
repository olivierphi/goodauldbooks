import { ServicesLocator } from "domain/services";
import { HigherOrderComponentToolbox } from "./HigherOrderComponentToolbox";

export interface OmniponentComponentToolbox extends HigherOrderComponentToolbox {
  servicesLocator: ServicesLocator;
}
