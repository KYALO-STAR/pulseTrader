import React from 'react';

const DemoGlyphIcon = ({ iconSize = 'xs' }: { iconSize?: 'xs' | 'sm' | 'md' | 'lg' }) => {
    const size = iconSize === 'xs' ? 16 : iconSize === 'sm' ? 20 : iconSize === 'md' ? 24 : 32;

    return (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width={size} height={size}>
            {/* Outer frame */}
            <rect width='32' height='32' rx='6' fill='#000000' />
            {/* Inner background */}
            <rect x='4' y='4' width='24' height='24' rx='4' fill='#3B4420' />
            {/* Combined $D glyph */}
            <path d='M10 6h4c6 0 10 4 10 10s-4 10-10 10h-4V6z' fill='#FFFFFF' />
            <line x1='10' y1='6' x2='10' y2='26' stroke='#FFFFFF' strokeWidth='2' />
            <line x1='7' y1='11' x2='13' y2='11' stroke='#FFFFFF' strokeWidth='2' />
            <line x1='7' y1='21' x2='13' y2='21' stroke='#FFFFFF' strokeWidth='2' />
        </svg>
    );
};

export default DemoGlyphIcon;
