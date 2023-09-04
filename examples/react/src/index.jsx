import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './components/app.jsx';
import Home from './components/pages/home.jsx';
import Page404 from './components/pages/404.jsx';

ReactDOM.render(
  <BrowserRouter>
    <App>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </App>
  </BrowserRouter>,
  document.getElementById('react-root')
);
