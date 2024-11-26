/**
 * This file provides simplified versions of the Fantasy Calc data models. These are easier to construct and contain the data that is actually needed.
 */

export interface Player {
    player: {
        id: number;
        name: string;
        position: string;
        mflId?: string;
        sleeperId?: string;
        espnId?: string;
        fleaflickerId?: string;
    }
    redraftValue: number;
    value?: number;
}

export interface Team {
    name: string;
    owner: string;
    ownerId: string;
    players: Player[];
}

export interface League {
    id: {
        value: string;
    };
    externalLeagueId: string;
    name: string;
    teams: Team[];
}

export interface PlayerTradeValue {
    value: number; // 100
    rb: Player | null
    wr: Player | null,
    te: Player | null,
    qb: Player | null,
}
