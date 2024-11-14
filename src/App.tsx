import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import { TradeCalculator } from './pages/TradeCalculator';
import LeagueForm from './components/LeagueForm';
import './styles/styles.css';
import './styles/simpleTradeResults.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/trade-calculator" element={<TradeCalculator />} />
        <Route path="/league-form" element={<LeagueForm />} />
      </Routes>
    </Router>
  );
};

export default App;
