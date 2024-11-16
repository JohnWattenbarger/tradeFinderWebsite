import React from 'react';
import { Player, Team } from '../types/httpModels';
import { Trade } from '../types/tradeModels';
import DetailedTradeResult from './detailedTradeResults';
import SimpleTradeResult from './simpleTradeResults';
// import { calculateStarterAndFlexValues } from '../utils/tradeUtils';

export interface TradeResultProps {
    selectedTeam: Team;
    tradesMap: Map<Team, Trade[]>;
    topTradesCount: number;
    maxValueDiff?: number;
    // onlyPositives?: boolean;
    minValueGained?: number;
    simplifiedView?: boolean;
    filteredPlayers?: Player[];
    minTradeablePlayerValue?: number;
}

const TradeResult: React.FC<TradeResultProps> = (props: TradeResultProps) => {
    return (
        <>
            {props.simplifiedView ? <SimpleTradeResult {...props} /> : <DetailedTradeResult {...props} />}
        </>
    );
};

export default TradeResult;
