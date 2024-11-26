import axios from 'axios';
import * as espnModels from '../types/espnModels';

const espnBase = 'https://lm-api-reads.fantasy.espn.com';
const year = '2024';
const proxyUrl = 'https://tradefinderbackend.onrender.com/proxy'; // use my backend server to call ESPN with cookies

export interface EspnCookies {
    espnS2: string;
    swid: string;
}

export const fetchEspnLeagueData = async (leagueId: string, espnCookies: EspnCookies): Promise<espnModels.League> => {
    // const url = `${proxyUrl}${espnBase}/apis/v3/games/FFL/seasons/${year}/segments/0/leagues/${leagueId}?view=mTeam&view=mRoster&view=mSettings`;
    const url = proxyUrl;
    const espnUrl = `${espnBase}/apis/v3/games/FFL/seasons/${year}/segments/0/leagues/${leagueId}?view=mTeam&view=mRoster&view=mSettings`;

    const body = {
        "url": espnUrl,
        "cookies": {
            "espn_s2": espnCookies.espnS2,
            "SWID": espnCookies.swid
        },
        "method": "GET"
    };
    const response = await axios.post(url, body);

    const responseOk = (response.status >= 200 && response.status < 300);
    if (!responseOk) {
        throw new Error("Failed to fetch league data");
    }

    return response.data;
};
