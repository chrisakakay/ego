import React from 'react';
import {  } from './configuration.jsx';

export const AppContext = React.createContext({});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    // run auth here
    this.setState({});
  }

  render() {
    const value = {
      ...this.state,
    };

    return (
      <AppContext.Provider value={value}>
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

export default App;
