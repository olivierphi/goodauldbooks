import { ACTIONS } from "domain/messages";
import * as React from "react";
import { Breadcrumb } from "../../components/Layout/Breadcrumb";
import { BreadcrumbData } from "../../domain/pages";
import { HigherOrderComponentToolkit } from "../HigherOrderComponentToolkit";

interface BreadcrumbContainerProps {
  hocToolkit: HigherOrderComponentToolkit;
}

interface BreadcrumbContainerState {
  currentBreadcrumb: BreadcrumbData | null;
}

export class BreadcrumbContainer extends React.Component<
  BreadcrumbContainerProps,
  BreadcrumbContainerState
> {
  constructor(props: BreadcrumbContainerProps) {
    super(props);
    this.state = { currentBreadcrumb: null };
    this.onSetBreadcrumb = this.onSetBreadcrumb.bind(this);
  }

  public componentDidMount() {
    this.props.hocToolkit.messageBus.on(ACTIONS.SET_BREADCRUMB, this.onSetBreadcrumb);
  }

  public componentWillUnmount() {
    this.props.hocToolkit.messageBus.off(ACTIONS.SET_BREADCRUMB, this.onSetBreadcrumb);
  }

  public render() {
    if (!this.state.currentBreadcrumb) {
      return null;
    }
    const booksLang = this.props.hocToolkit.appStateStore.getState().booksLang;

    return <Breadcrumb currentLang={booksLang} currentBreadcrumb={this.state.currentBreadcrumb} />;
  }

  private onSetBreadcrumb(breadcrumb: BreadcrumbData) {
    this.setBreadcrumb(breadcrumb);
  }

  private setBreadcrumb(breadcrumb: BreadcrumbData): void {
    this.setState({ currentBreadcrumb: breadcrumb });
  }
}
