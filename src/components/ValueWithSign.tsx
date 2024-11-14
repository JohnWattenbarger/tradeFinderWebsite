import React from 'react';

interface ValueWithSignProps {
    value: number;
}

const ValueWithSign: React.FC<ValueWithSignProps> = ({ value }) => {
    const className = value > 0 ? "positive" : value < 0 ? "negative" : "";
    const displayValue = `${value > 0 ? '+' : ''}${value}`;

    return <span className={className}>{displayValue}</span>;
};

export default ValueWithSign;
