// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import { TradeCalculator } from './pages/TradeCalculator';
import './styles/styles.css';
// import TradeCalculator from './pages/TradeCalculator';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/trade-calculator" element={<TradeCalculator />} />
      </Routes>
    </Router>
  );
};

export default App;
