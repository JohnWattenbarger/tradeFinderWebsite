import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LeagueForm: React.FC = () => {
    const [leagueId, setLeagueId] = useState('');
    const [site, setSite] = useState('Sleeper'); // default to Sleeper
    const [existingLeagues, setExistingLeagues] = useState<{ leagueId: string; site: string }[]>([]);
    const [selectedLeague, setSelectedLeague] = useState<string | null>(null); // Track the selected league
    const navigate = useNavigate();

    useEffect(() => {
        // Get saved leagues from localStorage
        const savedLeagues = localStorage.getItem('savedLeagues');
        if (savedLeagues) {
            setExistingLeagues(JSON.parse(savedLeagues));
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const leagueToSave = selectedLeague ? existingLeagues.find((league) => league.leagueId === selectedLeague) : { leagueId, site };

        if (leagueToSave) {
            // Save the new or selected league to localStorage
            const savedLeagues = localStorage.getItem('savedLeagues');
            const parsedLeagues = savedLeagues ? JSON.parse(savedLeagues) : [];

            // Add the new or selected league if it doesn't already exist
            const existingLeague = parsedLeagues.find(
                (league: { leagueId: string; site: string }) =>
                    league.leagueId === leagueToSave.leagueId && league.site === leagueToSave.site
            );

            if (!existingLeague) {
                parsedLeagues.push(leagueToSave);
                localStorage.setItem('savedLeagues', JSON.stringify(parsedLeagues));
            }

            // Navigate to TradeCalculator page with leagueId and site as URL params
            navigate(`/trade-calculator?leagueId=${leagueToSave.leagueId}&site=${leagueToSave.site}`);
        } else {
            alert('Please enter a valid League ID and select a site');
        }
    };

    const handleClearLeagues = () => {
        // Clear saved leagues from localStorage
        localStorage.removeItem('savedLeagues');
        // setSavedLeagues([]);
        setExistingLeagues([]);
    };

    return (
        <form onSubmit={handleSubmit}>
            {existingLeagues.length > 0 && (<>
                <div>
                    <label>Select Existing League:</label>
                    <select
                        value={selectedLeague || ''}
                        onChange={(e) => setSelectedLeague(e.target.value)}
                    >
                        <option value="">-- Select League --</option>
                        {existingLeagues.map((league) => (
                            <option key={league.leagueId} value={league.leagueId}>
                                {`${league.site} - ${league.leagueId}`}
                            </option>
                        ))}
                    </select>
                    <div>
                        <button type="button" onClick={handleClearLeagues}>
                            Clear saved leagues
                        </button>
                    </div>
                </div>
            </>
            )}

            <div>
                <label>League ID:</label>
                <input
                    type="text"
                    value={leagueId}
                    onChange={(e) => setLeagueId(e.target.value)}
                    placeholder="Enter League ID"
                    required={!selectedLeague} // Only require League ID if no existing league is selected
                />
            </div>
            <div>
                <label>League Site:</label>
                <select
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    disabled={selectedLeague !== null} // Disable if an existing league is selected
                >
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