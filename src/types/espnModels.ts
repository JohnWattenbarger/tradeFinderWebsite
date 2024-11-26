
export interface League {
    draftDetail: {
        drafted: boolean,
        inProgress: boolean,
    },
    gameId: number,
    // id: number,
    id: string,
    members: Member[],
    scoringPeriodId: number,
    seasonId: number,
    segmentId: number,
    status: unknown,
    teams: Team[],
    settings: Settings
}

export interface Member {
    displayName: string, // Patriots
    firstName: string, // Robert
    id: string, // "{368A6DCF-81F7-4242-B86E-1585A177F9F8}"
    lastName: string, // Craft
    notificationSettings: unknown[],
}

export interface Settings {
    name: string; // NFL
}

export interface Team {
    abbrev: string; // e.g., "NE"
    currentProjectedRank: number;
    divisionId: number;
    draftDayProjectedRank: number;
    draftStrategy: Record<string, unknown>; // Assuming it's an object with unknown structure
    id: number;
    isActive: boolean;
    logo: string; // e.g., "https://g.espncdn.com/lm-static/ffl/images/default_logos/6.svg"
    logoType: string; // e.g., "VECTOR"
    name: string; // e.g., "John's Scary Team"
    owners: string[]; // Array of owner IDs
    playoffSeed: number;
    points: number;
    pointsAdjusted: number;
    pointsDelta: number;
    primaryOwner: string; // Owner ID
    rankCalculatedFinal: number;
    rankFinal: number;
    record: unknown; // Need more details to type this accurately
    roster: {
        appliedStatTotal: number;
        entries: Player[]; // Assuming `Player` is already defined elsewhere
        tradeReservedEntries: number; // 0
    };
    tradeBlock: unknown;
    transactionCounter: unknown;
    valuesByStat: unknown;
    waiverRank: number; // 1
    watchList: unknown[];
}

export interface Player {
    acquisitionDate: number; // e.g., 1732190787751
    acquisitionType: string; // e.g., "DRAFT"
    injuryStatus: string; // e.g., "NORMAL"
    lineupSlotId: number; // e.g., 2
    pendingTransactionIds: unknown; // e.g., null
    playerId: number; // e.g., 3117251
    playerPoolEntry: {
        appliedStatTotal: number; // e.g., 11.14
        id: number; // e.g., 3117251
        keeperValue: number;
        keeperValueFuture: number;
        lineupLocked: boolean;
        onTeamId: number;
        player: {
            active: boolean;
            defaultPositionId: number;
            draftRanksByRankType: {
                STANDARD?: DraftRank;
                PPR?: DraftRank;
                [key: string]: DraftRank | undefined; // Allow other rank types
            };
            droppable: boolean;
            eligibleSlots: number[];
            firstName: string; // e.g., "Christian"
            fullName: string; // e.g., "Christian McCaffrey"
            id: number; // e.g., 3117251
            injured: boolean;
            injuryStatus: string; // e.g., "ACTIVE"
            lastName: string; // e.g., "McCaffrey"
            lastNewsDate?: number;
            lastVideoDate?: number;
            outlooks?: unknown;
            ownership: {
                auctionValueAverage: number;
                averageDraftPosition: number;
                percentChange: number;
                percentOwned: number;
                percentStarted: number;
            };
            proTeamId: number; // e.g., 25
            rankings?: unknown;
            seasonOutlook?: string;
            stats?: unknown[];
            universeId: number; // e.g., 2
        };
        ratings?: unknown;
        rosterLocked: boolean;
        status: string; // e.g., "ONTEAM"
        tradeLocked: boolean;
    };
    status: string; // e.g., "NORMAL"
}

interface DraftRank {
    auctionValue: number;
    published: boolean;
    rank: number;
    rankSourceId: number;
    rankType: string; // e.g., "STANDARD"
    slotId: number;
}
