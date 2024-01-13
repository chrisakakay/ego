import React, { useEffect } from 'react';
import { MainContent } from '../app.style.jsx';

const Page404 = () => {
  useEffect(() => {
    document.title = 'Page not found: 404';
  }, []);

  return (
    <MainContent>
      <div>404</div>
    </MainContent>
  );
};

export default Page404;
