import React from 'react';
// import ReactDOM from 'react-dom';
// import ReactDOM from 'react-dom/client';
import TradeResults from '../components/tradeResults';
// import { MessageTypes } from '../types/types';
// import { League, Player, Team } from '../types/httpModels';
import { League, Team } from '../types/httpModels';
import StartersForm, { StarterCount } from '../components/starterForm';
import { findAllTrades } from '../utils/tradeUtils';
import { Trade } from '../types/tradeModels';
import { fetchLeagueData } from '../shared/api';
import { Link, useLocation } from 'react-router-dom';

// TODO: better share this between background and tradeCalculator
// interface LeagueInfoMessage {
//     type: MessageTypes;
//     leagueId: string;
//     site: string;
//     data: League;
// }

// interface TradeCalculatorProps {
//     leagueId: string;
//     leagueType: string; // Should this be an enum?
// }

// Your trade calculator component
// export const TradeCalculator: React.FC<TradeCalculatorProps> = ({ leagueId, leagueType }) => {
export const TradeCalculator: React.FC = () => {
    console.log('New TradeCalculator')
    const [results, setResults] = React.useState<Map<Team, Trade[]>>();
    // const [leagueInfo, setLeagueInfo] = React.useState<{ leagueId: string; site: string } | null>(null);
    const [league, setLeague] = React.useState<League>();
    const [starterCounts, setStarterCounts] = React.useState<StarterCount>({ qb: 1, rb: 2, wr: 2, te: 1, flex: 1 });
    const [selectedTeamId, setSelectedTeamId] = React.useState('');
    const [maxValueDiff, setMaxValueDiff] = React.useState<number>(1000);
    const [onlyPositiveTrades, setOnlyPositiveTrades] = React.useState<boolean>(true);
    const [topTradeCounts, setTopTradeCounts] = React.useState<number>(5);
    const [simpleView, setSimpleView] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    // Retrieve the values of leagueId and site from the URL search params
    const leagueId = params.get('leagueId');
    const site = params.get('site');

    React.useEffect(() => {
        if (leagueId && site) {
            fetchLeagueData(leagueId, site).then((data: League) => {
                setLeague(data);

                setLoading(false);
            })
                .catch((error) => {
                    console.error("Error fetching league data:", error);
                });
        } else {
            throw new Error("Missing required parameters: leagueId and/or site.");
        }
    }, [])

    // const isLoading = !league;

    // React.useEffect(() => {
    //     console.log('first render');

    //     // TODO: see why this is getting triggered continuously
    //     const handleMessage = (message: LeagueInfoMessage, sender: any, sendResponse: any) => {
    //         if (message.type === MessageTypes.LEAGUE_DETAILS && !(leagueInfo && league)) {
    //             console.log('received message: ' + JSON.stringify(message));
    //             // Update the state with the received data
    //             setLeagueInfo({ leagueId: message.leagueId, site: message.site });
    //             setLeague(message.data);

    //             // Send a response back to indicate successful handling
    //             sendResponse({ success: true });
    //         }
    //     };

    //     // Listen for the message from the background script
    //     chrome.runtime.onMessage.addListener(handleMessage);

    //     // Clean up the listener when the component unmounts
    //     return () => {
    //         console.log('removing listener');
    //         chrome.runtime.onMessage.removeListener(handleMessage);
    //     };
    // }, []);

    const suggestTrade = () => {
        if (!league) throw `Unable to suggest trades. No team is selected.`;
        // Logic to fetch or generate trade suggestions
        // setResults(['Trade A', 'Trade B', 'Trade C']); // Example trade results
        const selectedTeam = getSelectedTeam();
        const allPossibleTrades = findAllTrades(league, selectedTeam, starterCounts);

        // setResults(['Team: ' + selectedTeamId + ' selected'])
        setResults(allPossibleTrades);
    };

    const getSelectedTeam = () => {
        // const selectedTeam = league?.teams.find(team => team.ownerId === selectedTeamId);
        const selectedTeam = league?.teams.find(team => team.owner === selectedTeamId);
        if (!selectedTeam) {
            throw new Error("Unable to suggest trades. Error getting selected team details.");
        }

        return selectedTeam;
    }

    return (
        <div className='trade-calculator'>
            {loading ? <div>Loading...</div> :
                <div>
                    {(league && starterCounts) && <div>
                        <h1>Trade Finder</h1>

                        <Link to="/">
                            {`League: ${league.name}`}
                        </Link>

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
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={onlyPositiveTrades}
                                    onChange={(e) => setOnlyPositiveTrades(e.target.checked)}
                                />
                                Show only positive trades
                            </label>
                        </div>

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

                        <button onClick={suggestTrade} disabled={!selectedTeamId}>
                            Find Trades
                        </button>
                    </div>}

                    {/* Conditionally render the TradeResults component if there are results */}
                    {results && <TradeResults selectedTeam={getSelectedTeam()} topTradesCount={topTradeCounts} tradesMap={results} maxValueDiff={maxValueDiff} onlyPositives={onlyPositiveTrades} simplifiedView={simpleView} />}

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

// export const run = () => {
//     // Ensure that the target element exists
//     const tradeContainer = document.querySelector('.trade-select-container');
//     if (tradeContainer) {
//         const newElement = document.createElement('div');
//         tradeContainer.appendChild(newElement);
//         const root = ReactDOM.createRoot(newElement);
//         root.render(<TradeCalculator />);
//     }
// };
