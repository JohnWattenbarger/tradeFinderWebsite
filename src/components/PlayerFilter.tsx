import React, { useState } from 'react';
import { Player } from '../types/httpModels';
import '../styles/PlayerFilter.css';
import PlayerCard from './PlayerCard';

interface PlayerFilterProps {
    players: Player[],
    filteredPlayers: Player[];
    setFilteredPlayers: React.Dispatch<React.SetStateAction<Player[] | undefined>>
}

export const PlayerFilter: React.FC<PlayerFilterProps> = ({ players, filteredPlayers, setFilteredPlayers }) => {
    const [isOpen, setIsOpen] = useState(false);
    // const [selectedPlayers, setSelectedPlayers] = React.useState<Player[]>([]);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handlePlayerClick = (player: Player) => {
        // const isSelected = filteredPlayers.some(p => p.player.id === player.player.id);
        // const updatedFilters = isSelected
        //     ? filteredPlayers.filter(p => p.player.id !== player.player.id)
        //     : [...filteredPlayers, player];
        // setFilteredPlayers(updatedFilters);

        let newSelectedPlayers: Player[] = [...(filteredPlayers ?? [])];
        if (filteredPlayers?.includes(player)) {
            newSelectedPlayers = newSelectedPlayers.filter(p => p !== player);
        } else {
            newSelectedPlayers.push(player);
        }

        // setSel
        setFilteredPlayers(newSelectedPlayers);
    };

    return (
        <div className="player-filter-container">
            <button className="filter-button" onClick={toggleDropdown}>
                Player Filter
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {players.map(player => {
                        const isSelected = filteredPlayers.some(p => p.player.id === player.player.id);
                        return (
                            <div
                                key={player.player.id}
                                // className={`player-card ${!isSelected ? 'selected' : 'disabled'}`}
                                onClick={() => handlePlayerClick(player)}
                            >
                                {/* <span className={`player-name ${player.player.position.toLowerCase()}`}>
                                    {player.player.name}
                                </span> */}
                                <PlayerCard player={player} className={`player-card ${!isSelected ? 'selected' : 'disabled'}`} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
