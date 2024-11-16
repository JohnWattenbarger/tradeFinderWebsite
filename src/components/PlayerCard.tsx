import React from 'react';
import { Player } from '../types/httpModels';

interface PlayerCardProps {
    player: Player;
    className?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, className }) => {
    // Dynamically determine the class based on player's position
    const positionClass = player.player.position ? player.player.position.toLowerCase() : ''; // Convert to lowercase to match class names

    return (
        <span className={`player-container tooltip-container`}>
            <span className={`player-name ${positionClass} ${className || ""}`}>
                {player.player.name}
            </span>
            <span className="tooltip">
                Player Value: {player.redraftValue}
            </span>
        </span>
    );
};

export default PlayerCard;
