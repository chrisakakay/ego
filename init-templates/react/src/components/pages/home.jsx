import React from 'react';

class Home extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  componentDidMount() {
    document.title = 'Home';
  }

  render() {
    return (
      <div>Home</div>
    );
  }
}

export default Home;
