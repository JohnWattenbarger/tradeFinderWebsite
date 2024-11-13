// src/pages/MainPage.tsx
import React from 'react';
import LeagueForm from '../components/LeagueForm';

const MainPage: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the Trade Finder</h1>
            <LeagueForm />
        </div>
    );
};

export default MainPage;
