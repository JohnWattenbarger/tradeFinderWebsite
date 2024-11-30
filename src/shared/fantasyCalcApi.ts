import axios from 'axios';
import { League } from '../types/httpModels';
import * as FantasyCalc from '../types/fantasyCalcModels';

const fantasyCalcBase = 'https://api.fantasycalc.com';

export const fetchLeagueData = async (leagueId: string, site: string): Promise<League> => {
    const url = `${fantasyCalcBase}/leagues/${leagueId}?site=${site}`;
    const response = await axios.get(url);
    return response.data;
};

export const getTradeChartData = async (numTeams: number = 10, isDynasty: boolean = false, ppr: number = .5, numQbs: number = 1): Promise<FantasyCalc.Player[]> => {
    // const url = `${fantasyCalcBase}/trade-chart/current?isDynasty=${isDynasty}&numQbs=${numQbs}&numTeams=${numTeams}&ppr=${ppr}`
    const url = `${fantasyCalcBase}/values/current?isDynasty=${isDynasty}&numQbs=${numQbs}&numTeams=${numTeams}&ppr=${ppr}`
    const response = await axios.get(url);
    return response.data;
}
