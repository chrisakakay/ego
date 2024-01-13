import React, { useEffect, useContext } from 'react';
import { AppContext } from '../app.jsx';
import { MainContent } from '../app.style.jsx';

const Home = () => {
  const context = useContext(AppContext);

  useEffect(() => {
    document.title = 'Home';
  }, []);

  return (
    <MainContent>
      <div>Hello {context.user.name} ({context.user.email})</div>
    </MainContent>
  );
};

export default Home;
