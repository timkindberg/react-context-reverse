import React from "react";

/**
 * Similar to React.createContext() but instead of the ancestor passing data to it's descendant,
 * the descendant passes data to a single ancestor.
 *
 * @param defaultValue The default value for the reverse context
 * @returns {{ReverseConsumer: ReverseConsumer, ReverseProvider: ReverseProvider}}
 */
export function createReverseContext(defaultValue) {
  const NativeContext = React.createContext();

  class ReverseProvider extends React.Component {
    setParentState = () => {};
    componentDidMount() {
      this.setParentState(this.props.value);
    }
    componentDidUpdate() {
      this.setParentState(this.props.value);
    }

    render() {
      return (
        <NativeContext.Consumer>
          {setState => {
            if (setState) this.setParentState = setState;
            return this.props.children;
          }}
        </NativeContext.Consumer>
      );
    }
  }

  class ReverseConsumer extends React.Component {
    state = {};
    setParentState = value => this.setState({ value });
    render() {
      return (
        <NativeContext.Provider value={this.setParentState}>
          {this.props.children(this.state.value)}
        </NativeContext.Provider>
      );
    }
  }

  return {
    ReverseConsumer,
    ReverseProvider
  };
}
