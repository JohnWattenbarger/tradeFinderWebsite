import { League, Player, Team } from "../types/httpModels";
import { Trade } from "../types/tradeModels";
import { StarterCount } from "../components/starterForm";

export const findAllTrades = (league: League, selectedTeam: Team, starterCounts: StarterCount, find2PlayerTrades?: boolean) => {
    console.log('Finding all trades for ' + selectedTeam.name);
    /** Map team IDs to the value of all starters */
    let initialStarterValueMap: Map<string, number> = new Map<string, number>();
    let tradesMap: Map<Team, Trade[]> = new Map<Team, Trade[]>();

    league.teams.forEach(team => {
        const initialStarterValue = calculateStarterAndFlexValues(team.players, starterCounts);
        // Note: We don't actually have a unique team ID, so I am using ownerID. If an owner could have 2 teams we could change this to use ownerId-Team.name
        initialStarterValueMap.set(team.ownerId, initialStarterValue);
    })

    league.teams.forEach(otherTeam => {
        getTradesBetweenTeams(selectedTeam, otherTeam, starterCounts, initialStarterValueMap, tradesMap);
    });

    if (find2PlayerTrades) {
        get2PlayerTradesBetweenTeams(tradesMap, initialStarterValueMap, starterCounts, league);
    }

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

const getTradesBetweenTeams = (selectedTeam: Team, otherTeam: Team, starterCounts: StarterCount, initialStarterValueMap: Map<string, number> = new Map<string, number>(), tradesMap: Map<Team, Trade[]>) => {
    if (otherTeam != selectedTeam) {
        console.log('- Finding trades for ' + otherTeam.name)
        let trades: Trade[] = [];

        selectedTeam.players.forEach(player => {
            if (!player.player.name.includes('Round')) { // Exclude draft picks that the site added
                otherTeam.players.forEach(otherPlayer => {
                    if (!otherPlayer.player.name.includes('Round')) { // Exclude draft picks that the site added
                        const trade = getTrade(player, otherPlayer, selectedTeam, otherTeam, initialStarterValueMap, starterCounts);

                        trades.push(trade);
                    }
                });
            }
        });

        // sort trades to have the highest combined gains first
        trades.sort((a, b) => {
            // Compare the upgrade differences (descending order)
            return (b.tradeValue.combinedUpgradeGained - a.tradeValue.combinedUpgradeGained);
        });

        tradesMap.set(otherTeam, trades);
    }
}

const get2PlayerTradesBetweenTeams = (tradesMap: Map<Team, Trade[]>, initialStarterValueMap: Map<string, number> = new Map<string, number>(), starterCounts: StarterCount, league: League) => {
    // Flatten all existing trades from the tradesMap into an array
    const allTrades: Trade[] = Array.from(tradesMap.values()).flat();

    allTrades.forEach(trade => {
        // Accumulate new trades here
        const newTrades: Trade[] = [];

        const fromPlayers = trade.TeamFrom.team.players.filter(player => !player.player.name.includes('Round'));
        const toPlayers = trade.TeamTo.team.players.filter(player => !player.player.name.includes('Round'));

        // Find all trades where a new player is added to the from team
        fromPlayers.forEach(fromPlayer => {
            if (!trade.TeamFrom.players.includes(fromPlayer)) {
                const newTrade = getTrade(fromPlayer, null /* already added */, trade.TeamFrom.team, trade.TeamTo.team, initialStarterValueMap, starterCounts, trade.TeamFrom.players, trade.TeamTo.players);
                newTrades.push(newTrade);
            }
        });

        // Find all trades where a new player is added to the to team
        fromPlayers.forEach(fromPlayer => {
            if (!trade.TeamFrom.players.includes(fromPlayer)) {
                toPlayers.forEach(toPlayer => {
                    if (!trade.TeamTo.players.includes(toPlayer)) {
                        const newTrade = getTrade(fromPlayer, toPlayer, trade.TeamFrom.team, trade.TeamTo.team, initialStarterValueMap, starterCounts, trade.TeamFrom.players, trade.TeamTo.players);
                        newTrades.push(newTrade);
                    }
                });
            }
        });

        // Find all trades where a new player is added to both teams
        toPlayers.forEach(toPlayer => {
            if (!trade.TeamTo.players.includes(toPlayer)) {
                const newTrade = getTrade(null /* already added */, toPlayer, trade.TeamFrom.team, trade.TeamTo.team, initialStarterValueMap, starterCounts, trade.TeamFrom.players, trade.TeamTo.players);
                newTrades.push(newTrade);
            }
        });

        const teamToTrades = tradesMap.get(trade.TeamTo.team) ?? [];
        tradesMap.set(trade.TeamTo.team, [...teamToTrades, ...newTrades]);
    });
}


const getTrade = (player: Player | null, otherPlayer: Player | null, selectedTeam: Team, otherTeam: Team, initialStarterValueMap: Map<string, number> = new Map<string, number>(), starterCounts: StarterCount, existingPlayers: Player[] = [], existingOtherPlayers: Player[] = []): Trade => {
    const fromPlayers = [...existingPlayers];
    if (player) fromPlayers.push(player);
    const fromPlayerValues = fromPlayers.reduce((sum, player) => sum + player.redraftValue, 0);

    const toPlayers = [...existingOtherPlayers];
    if (otherPlayer) toPlayers.push(otherPlayer);
    const toPlayerValues = toPlayers.reduce((sum, player) => sum + player.redraftValue, 0);

    // add other player and remove player from selectedTeam
    let selectedTeamCopy = [...selectedTeam.players];
    selectedTeamCopy = selectedTeamCopy.filter(p => !(fromPlayers.map(p => p.player.id).includes(p.player.id)) && !p.player.name.includes('Round'));
    // if (otherPlayer) {
    //     selectedTeamCopy.push(otherPlayer);
    // }
    selectedTeamCopy.push(...toPlayers);

    // add player and remove other player from otherTeam
    let otherTeamCopy = [...otherTeam.players];
    otherTeamCopy = otherTeamCopy.filter(p => !(toPlayers.map(p => p.player.id).includes(p.player.id)) && !p.player.name.includes('Round'));
    // if (player) {
    //     otherTeamCopy.push(player);
    // }
    otherTeamCopy.push(...fromPlayers);

    // calculate new team values
    const fromNewTeamValue = calculateStarterAndFlexValues(selectedTeamCopy, starterCounts);
    const toNewTeamValue = calculateStarterAndFlexValues(otherTeamCopy, starterCounts);

    const initialFromValue = initialStarterValueMap.get(selectedTeam.ownerId)!;
    const initialToValue = initialStarterValueMap.get(otherTeam.ownerId)!;

    const starterToGain = toNewTeamValue - initialToValue;
    const starterFromGain = fromNewTeamValue - initialFromValue;

    const trade: Trade = {
        TeamFrom: { team: selectedTeam, players: fromPlayers },
        TeamTo: { team: otherTeam, players: toPlayers },
        tradeValue: {
            // From Team
            teamFromBefore: initialFromValue,
            teamFromValue: fromNewTeamValue,
            starterFromGain, // from team value gained
            // To Team
            teamToBefore: initialToValue,
            teamToValue: toNewTeamValue,
            starterToGain, // to team value gained

            combinedUpgradeGained: (starterFromGain + starterToGain),
            netValueDifference: toPlayerValues - fromPlayerValues
        }
    }

    return trade;
}

const getStarterCount = (position: string, starterCounts: StarterCount) => {
    switch (position?.toLowerCase()) {
        case 'qb': return starterCounts.qb;
        case 'rb': return starterCounts.rb;
        case 'wr': return starterCounts.wr;
        case 'te': return starterCounts.te;
    }

    return 0;
}

export const getSortedAndFilteredTrades = (trades: Trade[], maxValueDiff: number | undefined, onlyPositives: boolean | undefined, topTradesCount: number) => {
    // Sort trades by net value difference (highest first)
    let sortedTrades = trades.sort((a, b) => b.tradeValue.combinedUpgradeGained - a.tradeValue.combinedUpgradeGained);
    sortedTrades = getTradesWithinMaxDiff(sortedTrades, maxValueDiff);
    sortedTrades = getPositiveTrades(sortedTrades, onlyPositives);

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

const getPositiveTrades = (sortedTrades: Trade[], onlyPositives?: boolean) => {
    // filter out negative returns for one team if specified
    if (onlyPositives) {
        // TODO: see if this is working? Looks like a negative starterTo slipped through
        sortedTrades = sortedTrades.filter(
            trade => { return (trade.tradeValue.starterFromGain > 0 && trade.tradeValue.starterToGain > 0) }
        );
    }

    return sortedTrades;
}

export const getBestTrades = (trades: Trade[], maxValueDiff: number | undefined, onlyPositives: boolean | undefined, topTradesCount: number) => {
    // Sort trades by net value difference (highest first)
    let sortedTrades = trades.sort((a, b) => b.tradeValue.starterFromGain - a.tradeValue.starterFromGain);
    sortedTrades = getTradesWithinMaxDiff(sortedTrades, maxValueDiff);
    sortedTrades = getPositiveTrades(sortedTrades, onlyPositives);

    // Return the full list if fewer than the desired top trades are available
    const topTrades = sortedTrades.length < topTradesCount
        ? sortedTrades
        : sortedTrades.slice(0, topTradesCount);

    return topTrades;
}
