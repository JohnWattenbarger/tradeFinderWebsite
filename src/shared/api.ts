import axios from 'axios';

export const fetchLeagueData = async (leagueId: string, site: string) => {
    const url = `https://api.fantasycalc.com/leagues/${leagueId}?site=${site}`;
    const response = await axios.get(url);
    return response.data;
};
