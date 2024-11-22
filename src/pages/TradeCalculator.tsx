import React from 'react';
import TradeResults from '../components/tradeResults';
import { League, Player, Team } from '../types/httpModels';
import StartersForm, { StarterCount } from '../components/starterForm';
import { findAllTrades } from '../utils/tradeUtils';
import { Trade } from '../types/tradeModels';
import { fetchLeagueData } from '../shared/api';
import { Link, useLocation } from 'react-router-dom';
import { PlayerFilter } from '../components/PlayerFilter';
import { saveLeague } from '../utils/storageUtils';
import { AxiosError } from 'axios';

// Your trade calculator component
export const TradeCalculator: React.FC = () => {
    console.log('New TradeCalculator')
    const [results, setResults] = React.useState<Map<Team, Trade[]>>();
    const [league, setLeague] = React.useState<League>();
    const [starterCounts, setStarterCounts] = React.useState<StarterCount>({ qb: 1, rb: 2, wr: 2, te: 1, flex: 1 });
    const [selectedTeamId, setSelectedTeamId] = React.useState('');
    const [maxValueDiff, setMaxValueDiff] = React.useState<number>(1000);
    const [minValueGained, setMinValueGained] = React.useState<number>(500);
    const [topTradeCounts, setTopTradeCounts] = React.useState<number>(15);
    const [simpleView, setSimpleView] = React.useState<boolean>(true);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [maxPlayersTraded, setMaxPlayersTraded] = React.useState<number>(1);
    const [minTradeablePlayerValue, setMinTradeablePlayerValue] = React.useState<number>(1000);
    const [filteredPlayers, setFilteredPlayers] = React.useState<Player[]>();
    const [error, setError] = React.useState<string>();

    // Caching findAllTrades last call
    const lastArgs = React.useRef<{ league: League, selectedTeam: Team, starterCounts: StarterCount, maxPlayersTraded: number }>();
    const lastResult = React.useRef();

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    // Retrieve the values of leagueId and site from the URL search params
    const leagueId = params.get('leagueId');
    const site = params.get('site');

    React.useEffect(() => {
        if (leagueId && site) {
            fetchLeagueData(leagueId, site).then((data: League) => {
                data?.teams.forEach(team => {
                    team.players = team.players.filter(p => !(p.player.name.includes('Round')));

                    const positionOrder = ["QB", "RB", "WR", "TE"]; // Define the desired order for positions

                    team.players = team.players.sort((a, b) => {
                        // Sort by position
                        const positionComparison =
                            positionOrder.indexOf(a.player.position) - positionOrder.indexOf(b.player.position);

                        if (positionComparison !== 0) {
                            return positionComparison; // Positions are different
                        }

                        // If positions are the same, sort by redraftValue (descending)
                        return b.redraftValue - a.redraftValue;
                    });

                });

                saveLeague({ leagueId, site });
                setLeague(data);
                setLoading(false);
            })
                .catch((error: AxiosError) => {
                    console.error("Error fetching league data:", error);

                    setError("Failed to fetch league data. Error message: " + error.message);
                    setLoading(false); // Stop the loading spinner
                });
        } else {
            setError("Missing required parameters: leagueId and/or site.");
            setLoading(false); // Stop the loading spinner
        }
    }, [leagueId, site])

    const suggestTrade = async () => {
        if (!league) throw `Unable to suggest trades. No team is selected.`;

        const selectedTeam = getSelectedTeam();

        let allPossibleTrades;
        // Check if the current call has the same arguments as the last one
        if (
            lastArgs &&
            lastArgs.current?.league.id === league.id &&
            lastArgs.current?.selectedTeam.ownerId === selectedTeam.ownerId &&
            JSON.stringify(lastArgs.current?.starterCounts) === JSON.stringify(starterCounts) &&
            lastArgs.current?.maxPlayersTraded === maxPlayersTraded
        ) {
            allPossibleTrades = lastResult.current;
            setResults(allPossibleTrades);
        } else {
            setResults(undefined);
            findAllTrades(league, selectedTeam, starterCounts, maxPlayersTraded).then(allPossibleTrades => {
                setResults(allPossibleTrades);
            });
        }
    };

    const getSelectedTeam = () => {
        const selectedTeam = league?.teams.find(team => team.owner === selectedTeamId);
        if (!selectedTeam) {
            throw new Error("Unable to suggest trades. Error getting selected team details.");
        }

        return selectedTeam;
    }

    console.log('filteredPlayers: ' + JSON.stringify(filteredPlayers?.map(p => p.player.name)));

    return (
        <div className='trade-calculator'>
            {error && <div>
                <div className="error-message">{error}</div>
                <Link to='/league-form'>
                    {`Click here to return home.`}
                </Link>
            </div>}
            {loading ? <div>Loading...</div> :
                <div>
                    {(league && starterCounts) && <div>
                        <h1>Trade Finder</h1>

                        <Link to='/league-form'>
                            {`League: ${league.name}`}
                        </Link>

                        <div className='form-group'>
                            <StartersForm starterCount={starterCounts} setStarterCount={setStarterCounts} />

                            <div>
                                <label>Max Allowed Player Value Difference:</label>
                                <input
                                    type="number"
                                    value={maxValueDiff}
                                    onChange={(e) => {
                                        const newValue = parseInt(e.target.value);
                                        setMaxValueDiff(newValue)
                                    }}
                                />
                            </div>
                            <div>
                                <label>Min Value Each Team Must Improve By</label>
                                <input
                                    type="number"
                                    value={minValueGained}
                                    onChange={(e) => {
                                        const newValue = parseInt(e.target.value);
                                        setMinValueGained(newValue)
                                    }}
                                />
                            </div>
                            <div>
                                <label>Min Player Trade Value To Include</label>
                                <input
                                    type="number"
                                    value={minTradeablePlayerValue}
                                    onChange={(e) => {
                                        const newValue = parseInt(e.target.value);
                                        setMinTradeablePlayerValue(newValue)
                                    }}
                                />
                            </div>
                            <div>
                                <label>Trades Per Team:</label>
                                <input
                                    type="number"
                                    value={topTradeCounts}
                                    onChange={(e) => {
                                        const newValue = parseInt(e.target.value);
                                        setTopTradeCounts(newValue)
                                    }}
                                />
                            </div>
                            {/* <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={onlyPositiveTrades}
                                        onChange={(e) => setOnlyPositiveTrades(e.target.checked)}
                                    />
                                    Show only positive trades
                                </label>
                            </div> */}

                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={simpleView}
                                        onChange={(e) => setSimpleView(e.target.checked)}
                                    />
                                    Simplified Results View
                                </label>
                            </div>

                            <div>
                                <label>Max Players Traded by Each Team</label>
                                <input
                                    type="number"
                                    value={maxPlayersTraded}
                                    onChange={(e) => {
                                        const newValue = parseInt(e.target.value);
                                        setMaxPlayersTraded(newValue)
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="team-select">Select a team:</label>
                                <select
                                    id="team-select"
                                    value={selectedTeamId}
                                    onChange={(e) => setSelectedTeamId(e.target.value)}
                                >
                                    <option value="" disabled>Select a team</option>
                                    {league.teams.map((team) => {
                                        console.log('Rendering team: ' + team.name + ' - ' + team.owner);
                                        return <option key={team.owner} value={team.owner}>
                                            {`${team.name} - @${team.owner}`}
                                        </option>
                                    })}
                                </select>
                            </div>
                            <button style={{ margin: "20px 10px" }} onClick={suggestTrade} disabled={!selectedTeamId}>
                                Find Trades
                            </button>
                        </div>
                    </div>}

                    {/* Results filters */}
                    {selectedTeamId && results && (
                        <PlayerFilter
                            players={getSelectedTeam()?.players || []} // Safely handle null/undefined values
                            filteredPlayers={filteredPlayers ?? []}
                            setFilteredPlayers={setFilteredPlayers}
                        />
                    )}

                    {/* Conditionally render the TradeResults component if there are results */}
                    {results && <TradeResults selectedTeam={getSelectedTeam()} topTradesCount={topTradeCounts} tradesMap={results} maxValueDiff={maxValueDiff} minValueGained={minValueGained} simplifiedView={simpleView} filteredPlayers={filteredPlayers} minTradeablePlayerValue={minTradeablePlayerValue} />}

                    <footer>
                        <p>
                            Player values sourced from{' '}
                            <a href="https://fantasycalc.com" target="_blank" rel="noopener noreferrer">
                                fantasycalc.com
                            </a>
                        </p>
                    </footer>
                </div>}
        </div>
    );
};
