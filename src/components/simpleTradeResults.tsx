import React from 'react';
import { Team } from '../types/httpModels';
import { Trade } from '../types/tradeModels';
import { getBestTrades, getSortedAndFilteredTrades } from '../utils/tradeUtils';
import ValueWithSign from './ValueWithSign';
import '../styles/simpleTradeResults.css';
import TeamName from './TeamName';

interface TradeResultProps {
    selectedTeam: Team;
    tradesMap: Map<Team, Trade[]>;
    topTradesCount: number;
    maxValueDiff?: number;
    onlyPositives?: boolean;
}

const SimpleTradeResult: React.FC<TradeResultProps> = ({ selectedTeam, tradesMap, topTradesCount, maxValueDiff, onlyPositives }) => {
    const renderTeamResult = (otherTeam: Team, trades: Trade[]) => {
        console.log(' filter out <0 = ' + onlyPositives)
        if (otherTeam !== selectedTeam) {
            const filteredTrades = getSortedAndFilteredTrades(trades, maxValueDiff, onlyPositives, topTradesCount);

            return (
                <div key={otherTeam.ownerId}>
                    <TeamName team={otherTeam} />
                    <div className="team-trades-container">
                        {filteredTrades.map((trade, index) => (
                            <>{renderTradeDetails(trade, index, false)}</>
                        ))}
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    const renderBestTrades = () => {
        // Collect all trades into a single array
        const allTrades: Trade[] = Array.from(tradesMap.values()).flat();
        const bestTrades = getBestTrades(allTrades, maxValueDiff, onlyPositives, topTradesCount);

        return <div>
            <span style={{ fontWeight: 'bold' }}>{`Top Trades:`}</span>
            <div className="team-trades-container">
                {bestTrades.map((trade, index) => (
                    <>{renderTradeDetails(trade, index)}</>
                ))}
            </div>
        </div>
    }

    const renderTradeDetails = (trade: Trade, index: number, renderTeamName: boolean = true) => {
        return <div key={index} className="trade-details">
            <div className="trade-info">
                {/* Trade Details for selectedTeam -> otherTeam */}
                <div className="trade-team-info">
                    {/* Show trade player like this: ` > [TradingTeam - owner] Josh Allen - Garrett Wilson ==> +2976 / +2053, difference: +764` */}
                    <span>
                        {renderTeamName && <TeamName team={trade.TeamTo.team} />}
                        <span className='from-team'>
                            {trade.TeamFrom.players.map((player, index) => (
                                <span key={player.player.id}>
                                    {index === 0 ? `${player.player.name}` : `, ${player.player.name}`}
                                </span>
                            ))}
                            <span>{' ('}</span><ValueWithSign value={trade.tradeValue.starterFromGain} /><span>{')'}</span>
                        </span>
                        <span className='separator'>{' for '}</span>
                        <span className='to-team'>
                            {trade.TeamTo.players.map((player, index) => (
                                <span key={player.player.id}>
                                    {index === 0 ? `${player.player.name}` : `, ${player.player.name}`}
                                </span>
                            ))}
                            <span>{' ('}</span><ValueWithSign value={trade.tradeValue.starterToGain} /><span>{')'}</span>
                        </span>
                        <span className='separator'>{' ==> '}</span>
                        <span className='difference'>
                            <span>{'difference: '}</span>
                            <ValueWithSign value={trade.tradeValue.netValueDifference} />
                        </span>
                    </span>
                </div>
            </div>
        </div>
    }

    return (
        <div>
            <h3>Suggested Trades for {selectedTeam.name} - {selectedTeam.owner}</h3>
            <hr />
            {renderBestTrades()}
            {Array.from(tradesMap.entries()).map(([otherTeam, trades]) => {
                return renderTeamResult(otherTeam, trades);
            })}
        </div>
    );
};

export default SimpleTradeResult;
