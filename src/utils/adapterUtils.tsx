import { getTradeChartData } from '../shared/fantasyCalcApi';
import * as Espn from '../types/espnModels';
import { League, Team } from '../types/httpModels';
import * as FantasyCalc from '../types/fantasyCalcModels';

export async function espnLeagueToFantasyCalcLeague(espnLeague: Espn.League): Promise<League | null> {
    if (!espnLeague) {
        return null;
    }

    const ownerIdToNameMap: Map<string, string> = new Map<string, string>();
    espnLeague.members.forEach(member => {
        // const cleanedId = member.id.replace(/[{}]/g, '');
        // ownerIdToNameMap.set(cleanedId, member.displayName);
        ownerIdToNameMap.set(member.id, member.displayName);
    })

    const numTeams = espnLeague.teams.length;
    // TODO: dynamically set these values
    const isDynasty = false;
    const ppr = .5;
    const numQbs = 1;
    const tradeChartData: FantasyCalc.PlayerTradeValue[] = await getTradeChartData(numTeams, isDynasty, ppr, numQbs);

    const fantasyCalcTeams: Team[] = espnTeamsToFantasyCalcTeams(espnLeague.teams, tradeChartData, ownerIdToNameMap);
    const fantasyCalcLeague: League = { externalLeagueId: espnLeague.id, id: { value: espnLeague.id }, name: espnLeague.settings.name, teams: fantasyCalcTeams }

    return fantasyCalcLeague;
}

function espnTeamsToFantasyCalcTeams(espnTeams: Espn.Team[], tradeChartData: FantasyCalc.PlayerTradeValue[], ownerIdToNameMap: Map<string, string>): Team[] {
    const newTeams = espnTeams.map(espnTeam => {
        return espnTeamToFantasyCalcTeam(espnTeam, tradeChartData, ownerIdToNameMap);
    })

    return newTeams;
}

function espnTeamToFantasyCalcTeam(espnTeam: Espn.Team, tradeChartData: FantasyCalc.PlayerTradeValue[], ownerIdToNameMap: Map<string, string>): Team {
    const espnPlayerIds: string[] = espnTeam.roster.entries.map(espnPlayer => {
        return `${espnPlayer.playerId}`;
    })
    const tradePlayers = tradeChartData.map(playerTradeValue => {
        if (playerTradeValue.qb) return playerTradeValue.qb;
        if (playerTradeValue.rb) return playerTradeValue.rb;
        if (playerTradeValue.wr) return playerTradeValue.wr;
        if (playerTradeValue.te) return playerTradeValue.te;

        return null;
    });
    const newPlayers = tradePlayers.filter(p => {
        return (p && espnPlayerIds.includes(p.player.espnId))
    })

    const newTeam: Team = {
        name: espnTeam.name,
        owner: ownerIdToNameMap.get(espnTeam.primaryOwner) ?? '',
        ownerId: espnTeam.primaryOwner,
        players: (newPlayers as FantasyCalc.Player[])
    }

    return newTeam;
}