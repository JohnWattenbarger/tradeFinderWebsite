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
    const [minValueGained, setMinValueGained] = React.useState<number>(500);
    // const [maxImprovementDiff, setMaxImprovementDiff] = React.useState<number>(0);
    const [topTradeCounts, setTopTradeCounts] = React.useState<number>(15);
    const [simpleView, setSimpleView] = React.useState<boolean>(true);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [maxPlayersTraded, setMaxPlayersTraded] = React.useState<number>(1);

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

        // setResults(['Team: ' + selectedTeamId + ' selected'])
        // setResults(allPossibleTrades);
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

                    {/* Conditionally render the TradeResults component if there are results */}
                    {results && <TradeResults selectedTeam={getSelectedTeam()} topTradesCount={topTradeCounts} tradesMap={results} maxValueDiff={maxValueDiff} minValueGained={minValueGained} simplifiedView={simpleView} />}

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
