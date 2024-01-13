import React, { useState, useEffect } from 'react';
import {  } from './configuration.jsx';

export const AppContext = React.createContext({});

const App = ({ children }) => {
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    // run auth here
    setUser({ name: 'World', email: 'hello@world.com' });
  }, []);

  return (
    <AppContext.Provider value={{
      user
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default App;
