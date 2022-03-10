import React from 'react';

class Page404 extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  componentDidMount() {
    document.title = 'Page not found: 404';
  }

  render() {
    return (
      <div>404</div>
    );
  }
}

export default Page404;
