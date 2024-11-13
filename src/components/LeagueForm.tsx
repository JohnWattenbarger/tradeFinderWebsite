// src/components/LeagueForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LeagueForm: React.FC = () => {
    const [leagueId, setLeagueId] = useState('');
    const [site, setSite] = useState('Sleeper'); // default to Sleeper
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (leagueId) {
            // Navigate to TradeCalculator page with leagueId and site as URL params
            navigate(`/trade-calculator?leagueId=${leagueId}&site=${site}`);
        } else {
            alert('Please enter a valid League ID');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>League ID:</label>
                <input
                    type="text"
                    value={leagueId}
                    onChange={(e) => setLeagueId(e.target.value)}
                    placeholder="Enter League ID"
                    required
                />
            </div>
            <div>
                <label>League Site:</label>
                <select value={site} onChange={(e) => setSite(e.target.value)}>
                    <option value="Sleeper">Sleeper</option>
                    <option value="MFL">MFL</option>
                    <option value="ESPN">ESPN</option>
                    <option value="Fleaflicker">Fleaflicker</option>
                </select>
            </div>
            <button type="submit">Go to Trade Finder</button>
        </form>
    );
};

export default LeagueForm;
