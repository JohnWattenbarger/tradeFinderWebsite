import { League, Player, Team } from "../types/httpModels";
import { Trade } from "../types/tradeModels";
import { StarterCount } from "../components/starterForm";

export const findAllTrades = async (league: League, selectedTeam: Team, starterCounts: StarterCount, maxPlayersTraded: number = 1) => {
    console.log('Finding all trades for ' + selectedTeam.name);
    /** Map team IDs to the value of all starters */
    let initialStarterValueMap: Map<string, number> = new Map<string, number>();
    let tradesMap: Map<Team, Trade[]> = new Map<Team, Trade[]>();

    league.teams.forEach(team => {
        const initialStarterValue = calculateStarterAndFlexValues(team.players, starterCounts);
        // Note: We don't actually have a unique team ID, so I am using ownerID. If an owner could have 2 teams we could change this to use ownerId-Team.name
        initialStarterValueMap.set(team.ownerId, initialStarterValue);
    })

    // const maxPlayersTraded = find2PlayerTrades ? 2 : 1;
    league.teams.forEach(otherTeam => {
        getTradesBetweenTeams(selectedTeam, otherTeam, starterCounts, initialStarterValueMap, tradesMap, maxPlayersTraded);
    });

    return tradesMap;
}

export function calculateStarterAndFlexValues(players: Player[], starterCounts: StarterCount) {
    // const players = team.players;

    // Sort players by value in descending order
    const sortedPlayers = [...players].sort((a, b) => b.redraftValue - a.redraftValue);

    // Track how many starters we've assigned by position
    const flexPositions = ["RB", "WR", "TE"];
    const positionCount: { [position: string]: number } = { QB: 0, RB: 0, WR: 0, TE: 0 };
    const starters: Player[] = [];
    const backups: Player[] = [];

    // Separate starters from backups
    for (const player of sortedPlayers) {
        if (positionCount[player.player.position] < getStarterCount(player.player.position, starterCounts)) {
            starters.push(player);
            positionCount[player.player.position] += 1;
        } else {
            backups.push(player);  // Any player exceeding starter counts is a backup
        }
    }

    // Select the top `numFlex` backups for the flex positions
    const flexPlayers = backups.filter(player => flexPositions.includes(player.player.position)).slice(0, starterCounts.flex);

    // Calculate total starter and flex values
    const starterValue = starters.reduce((total, player) => total + player.redraftValue, 0);
    const flexValue = flexPlayers.reduce((total, player) => total + player.redraftValue, 0);

    return starterValue + flexValue;
}

const getTradesBetweenTeams = (
    selectedTeam: Team,
    otherTeam: Team,
    starterCounts: StarterCount,
    initialStarterValueMap: Map<string, number>,
    tradesMap: Map<Team, Trade[]>,
    maxPlayersTraded: number = 2 // Set default to 2 players traded
) => {
    if (otherTeam !== selectedTeam) {
        console.log('- Finding trades for ' + otherTeam.name);

        let trades: Trade[] = [];

        // Filter out draft picks and get players for both teams
        const selectedTeamPlayers = selectedTeam.players.filter(player => !player.player.name.includes('Round'));
        const otherTeamPlayers = otherTeam.players.filter(player => !player.player.name.includes('Round'));

        // Generate trades for the selected team
        for (let numPlayersTraded = 1; numPlayersTraded <= maxPlayersTraded; numPlayersTraded++) {
            // Generate all combinations of up to `numPlayersTraded` players for each team
            const selectedTeamCombinations = getCombinations(selectedTeamPlayers, numPlayersTraded);
            const otherTeamCombinations = getCombinations(otherTeamPlayers, numPlayersTraded);

            // For each combination of players on one team, generate trades with combinations of players on the other team
            selectedTeamCombinations.forEach(fromCombination => {
                otherTeamCombinations.forEach(toCombination => {
                    const trade = getTrade(fromCombination, toCombination, selectedTeam, otherTeam, initialStarterValueMap, starterCounts);
                    if (trade) {
                        trades.push(trade);
                    }
                });
            });
        }

        // Sort trades to prioritize the ones with the highest combined upgrade gained
        trades.sort((a, b) => (b.tradeValue.combinedUpgradeGained - a.tradeValue.combinedUpgradeGained));

        tradesMap.set(otherTeam, trades);
    }
};

// Helper function to generate combinations of players
const getCombinations = (players: Player[], numPlayers: number): Player[][] => {
    const combinations: Player[][] = [];
    const helper = (start: number, currentCombination: Player[]) => {
        if (currentCombination.length === numPlayers) {
            combinations.push([...currentCombination]);
            return;
        }

        for (let i = start; i < players.length; i++) {
            currentCombination.push(players[i]);
            helper(i + 1, currentCombination);
            currentCombination.pop();
        }
    };

    helper(0, []);
    return combinations;
};

const getTrade = (
    fromPlayersList: Player[] | null,
    toPlayersList: Player[] | null,
    selectedTeam: Team,
    otherTeam: Team,
    initialStarterValueMap: Map<string, number> = new Map<string, number>(),
    starterCounts: StarterCount,
    existingPlayers: Player[] = [],
    existingOtherPlayers: Player[] = []
): Trade => {
    // Initialize fromPlayers and toPlayers with the existing ones
    const fromPlayers = [...existingPlayers];
    if (fromPlayersList) fromPlayers.push(...fromPlayersList);  // Add players from the list if provided
    const fromPlayerValues = fromPlayers.reduce((sum, player) => sum + player.redraftValue, 0);

    const toPlayers = [...existingOtherPlayers];
    if (toPlayersList) toPlayers.push(...toPlayersList);  // Add players from the list if provided
    const toPlayerValues = toPlayers.reduce((sum, player) => sum + player.redraftValue, 0);

    // Remove the players that are part of the trade and recalculate the teams
    let selectedTeamCopy = [...selectedTeam.players];
    selectedTeamCopy = selectedTeamCopy.filter(p => !fromPlayers.map(p => p.player.id).includes(p.player.id) && !p.player.name.includes('Round'));
    selectedTeamCopy.push(...toPlayers);  // Add the players from the 'to' team

    let otherTeamCopy = [...otherTeam.players];
    otherTeamCopy = otherTeamCopy.filter(p => !toPlayers.map(p => p.player.id).includes(p.player.id) && !p.player.name.includes('Round'));
    otherTeamCopy.push(...fromPlayers);  // Add the players from the 'from' team

    // Calculate the new team values after the trade
    const fromNewTeamValue = calculateStarterAndFlexValues(selectedTeamCopy, starterCounts);
    const toNewTeamValue = calculateStarterAndFlexValues(otherTeamCopy, starterCounts);

    const initialFromValue = initialStarterValueMap.get(selectedTeam.ownerId)!;
    const initialToValue = initialStarterValueMap.get(otherTeam.ownerId)!;

    const starterToGain = toNewTeamValue - initialToValue;
    const starterFromGain = fromNewTeamValue - initialFromValue;

    // Create the trade object
    const trade: Trade = {
        TeamFrom: { team: selectedTeam, players: fromPlayers },
        TeamTo: { team: otherTeam, players: toPlayers },
        tradeValue: {
            teamFromBefore: initialFromValue,
            teamFromValue: fromNewTeamValue,
            starterFromGain, // From team value gained
            teamToBefore: initialToValue,
            teamToValue: toNewTeamValue,
            starterToGain, // To team value gained

            combinedUpgradeGained: (starterFromGain + starterToGain),
            netValueDifference: toPlayerValues - fromPlayerValues
        }
    };

    return trade;
};

const getStarterCount = (position: string, starterCounts: StarterCount) => {
    switch (position?.toLowerCase()) {
        case 'qb': return starterCounts.qb;
        case 'rb': return starterCounts.rb;
        case 'wr': return starterCounts.wr;
        case 'te': return starterCounts.te;
    }

    return 0;
}

export const getSortedAndFilteredTrades = (trades: Trade[], maxValueDiff: number | undefined, minValueGained: number | undefined, topTradesCount: number, filteredPlayers: Player[] | undefined) => {
    // Sort trades by net value difference (highest first)
    let sortedTrades = trades.sort((a, b) => b.tradeValue.combinedUpgradeGained - a.tradeValue.combinedUpgradeGained);
    sortedTrades = getTradesWithinMaxDiff(sortedTrades, maxValueDiff);
    sortedTrades = getTradesWithMinValueGained(sortedTrades, minValueGained);
    sortedTrades = getTradesWithoutFilteredPlayers(sortedTrades, filteredPlayers);

    // Return the full list if fewer than the desired top trades are available
    const topTrades = sortedTrades.length < topTradesCount
        ? sortedTrades
        : sortedTrades.slice(0, topTradesCount);

    return topTrades;
}

const getTradesWithinMaxDiff = (sortedTrades: Trade[], maxValueDiff?: number) => {
    // Apply max value difference filter if specified
    if (maxValueDiff) {
        sortedTrades = sortedTrades.filter(
            trade => Math.abs(trade.tradeValue.netValueDifference) <= maxValueDiff
        );
    }

    return sortedTrades;
}

const getTradesWithMinValueGained = (sortedTrades: Trade[], minValueGained?: number) => {
    // filter out negative returns for one team if specified
    if (minValueGained !== undefined) {
        // TODO: see if this is working? Looks like a negative starterTo slipped through
        sortedTrades = sortedTrades.filter(
            trade => { return (trade.tradeValue.starterFromGain > minValueGained && trade.tradeValue.starterToGain > minValueGained) }
        );
    }

    return sortedTrades;
}

const getTradesWithoutFilteredPlayers = (sortedTrades: Trade[], filteredPlayers?: Player[]) => {
    if (filteredPlayers && filteredPlayers.length > 0) {
        // Create a set of filtered player IDs for quick lookup
        const filteredPlayerIds = new Set(filteredPlayers.map(player => player.player.id));

        return sortedTrades.filter(trade => {
            // Check if any player in TeamFrom or TeamTo matches a filtered player
            const hasFilteredPlayers =
                trade.TeamFrom.players.some(player => filteredPlayerIds.has(player.player.id)) ||
                trade.TeamTo.players.some(player => filteredPlayerIds.has(player.player.id));

            // Exclude trades with filtered players
            return !hasFilteredPlayers;
        });

    }

    return sortedTrades;
}

export const getBestTrades = (trades: Trade[], maxValueDiff: number | undefined, minValueGained: number | undefined, topTradesCount: number, filteredPlayers: Player[] | undefined) => {
    // Sort trades by net value difference (highest first)
    let sortedTrades = trades.sort((a, b) => b.tradeValue.starterFromGain - a.tradeValue.starterFromGain);
    sortedTrades = getTradesWithinMaxDiff(sortedTrades, maxValueDiff);
    sortedTrades = getTradesWithMinValueGained(sortedTrades, minValueGained);
    sortedTrades = getTradesWithoutFilteredPlayers(sortedTrades, filteredPlayers);

    // Return the full list if fewer than the desired top trades are available
    const topTrades = sortedTrades.length < topTradesCount
        ? sortedTrades
        : sortedTrades.slice(0, topTradesCount);

    return topTrades;
}
