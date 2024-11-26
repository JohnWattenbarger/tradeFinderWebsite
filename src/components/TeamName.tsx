import React, { useMemo } from 'react';
import { Team } from '../types/httpModels';

// Hash function to generate a number from a string
function hashStringToNumber(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

// Generate a light color from a hash
function getRandomColorFromHash(str: string) {
    const hash = hashStringToNumber(str);
    // Ensure RGB values are between 155-255 for light colors
    const r = 155 + (hash % 100);
    const g = 155 + ((hash >> 8) % 100);
    const b = 155 + ((hash >> 16) % 100);
    const darkSchemeColor = `rgb(${r}, ${g}, ${b})`;

    const r2 = 255 - r;
    const g2 = 255 - g;
    const b2 = 255 - b;
    const lightSchemeColor = `rgb(${r2}, ${g2}, ${b2})`

    return `light-dark(${lightSchemeColor}, ${darkSchemeColor})`;
}

interface TeamNameProps {
    team: Team;
}

const TeamName: React.FC<TeamNameProps> = ({ team }) => {
    const teamColor = useMemo(() => getRandomColorFromHash(team.name), [team.name]);

    return (
        <span className='simple-team-name' style={{ color: teamColor }}>
            {`${team.name} - ${team.owner}`}:
        </span>
    );
};

export default TeamName;
