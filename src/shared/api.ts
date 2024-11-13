import axios from 'axios';
import { League } from '../types/httpModels';

export const fetchLeagueData = async (leagueId: string, site: string): Promise<League> => {
    const url = `https://api.fantasycalc.com/leagues/${leagueId}?site=${site}`;
    const response = await axios.get(url);
    return response.data;
};
