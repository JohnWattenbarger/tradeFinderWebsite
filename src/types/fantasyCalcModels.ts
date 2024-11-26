export interface Player {
    player: {
        id: number;
        name: string;
        mflId: string;
        sleeperId: string;
        position: string;
        maybeBirthday: string;
        maybeHeight: string;
        maybeWeight: number;
        maybeCollege: string;
        maybeTeam: string;
        maybeAge: number;
        maybeYoe: number;
        espnId: string;
        fleaflickerId: string;
    }
    value: number;
    overallRank: number;
    positionRank: number;
    trend30Day: number;
    redraftDynastyValueDifference: number;
    redraftDynastyValuePercDifference: number;
    redraftValue: number;
    combinedValue: number;
    maybeMovingStandardDeviation: number;
    maybeMovingStandardDeviationPerc: number;
    maybeMovingStandardDeviationAdjusted: number;
    displayTrend: boolean;
    maybeOwner: string | null;
    starter: boolean;
    maybeTier: number;
    maybeAdp: number | null;
    maybeTradeFrequency: number;
}

export interface Team {
    name: string;
    owner: string;
    ownerId: string;
    players: Player[];
    overallValue: number;
    overallRank: number;
    qbValue: number;
    qbRank: number;
    rbValue: number;
    rbRank: number;
    wrValue: number;
    wrRank: number;
    teValue: number;
    teRank: number;
    pickValue: number;
    pickRank: number;
    averageAge: number;
    adjustedAverageAge: number;
    trend30Day: number;
    rosterId: number;
    record: {
        wins: number;
        losses: number;
        ties: number;
        pointsScored: number;
        ppgRank: number;
        maxPointsForRank: number;
    };
    starters: unknown | null;
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
    // player: {
    //     id: 7257,
    //     name: "Saquon Barkley",
    //     mflId: "13604",
    //     sleeperId: "4866",
    //     position: "RB",
    //     maybeBirthday: "1997-02-09",
    //     maybeHeight: "72",
    //     maybeWeight: 233,
    //     maybeCollege: "Penn State",
    //     maybeTeam: "PHI",
    //     maybeAge: 27.8,
    //     maybeYoe: 6,
    //     espnId: "3929630",
    //     fleaflickerId: "13778",
    // },
    // value: 10537,
    // overallRank: 1,
    // positionRank: 1,
    // trend30Day: 468,
    // redraftDynastyValueDifference: -4,
    // redraftDynastyValuePercDifference: 0,
    // redraftValue: 10533,
    // combinedValue: 21070,
    // maybeMovingStandardDeviation: -3,
    // maybeMovingStandardDeviationPerc: 0,
    // maybeMovingStandardDeviationAdjusted: 2,
    // displayTrend: false,
    // maybeOwner: null,
    // starter: false,
    // maybeTier: 1,
    // maybeAdp: null,
    // maybeTradeFrequency: 0.013,
    // }
    wr: Player | null,
    te: Player | null,
    qb: Player | null,
}
