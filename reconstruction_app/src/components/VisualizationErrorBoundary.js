import React from "react";
import PropTypes from "prop-types";

export default class VisualizationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error info somewhere
  }
  render() {
    if (this.state.errorInfo) {
      return null;
    }
    return this.props.children;
  }
}

VisualizationErrorBoundary.propTypes = {
  children: PropTypes.node,
};
