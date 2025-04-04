import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FighterOfTheDay from './components/FighterOfTheDay';
import UnlimitedMode from './components/UnlimitedMode';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<FighterOfTheDay />} />
        <Route path="/unlimited" element={<UnlimitedMode />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
