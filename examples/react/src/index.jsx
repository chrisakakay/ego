import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import App, { AppContext } from './components/app.jsx';
import Home from './components/pages/home.jsx';
import Page404 from './components/pages/404.jsx';

const container = document.getElementById('react-root');
const root = createRoot(container);

root.render(
  <Router>
    <App>
      <AppContext.Consumer>
        {() =>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Page404 />} />
          </Routes>
        }
      </AppContext.Consumer>
    </App>
  </Router>
);
