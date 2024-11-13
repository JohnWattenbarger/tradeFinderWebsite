// src/pages/MainPage.tsx
import React, { useEffect } from 'react';
// import LeagueForm from '../components/LeagueForm';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const savedLeagues = localStorage.getItem('savedLeagues');
        if (savedLeagues) {
            const parsedLeagues = JSON.parse(savedLeagues);
            if (parsedLeagues.length > 0) {
                // Get the last saved league
                const lastLeague = parsedLeagues[parsedLeagues.length - 1];
                // Navigate to TradeCalculator with the saved leagueId and site
                navigate(`/trade-calculator?leagueId=${lastLeague.leagueId}&site=${lastLeague.site}`);
            } else {
                // If no league is saved, navigate to the LeagueForm route to choose one
                navigate('/league-form');
            }
        } else {
            // No saved leagues, navigate to the LeagueForm route to choose a league
            navigate('/league-form');
        }
    }, [navigate]);

    return (
        <div>
            <h1>Welcome to the Trade Finder</h1>
        </div>
    );
};

export default MainPage;
