import React from 'react';

const DemoGlyphIcon = ({ iconSize = 'xs' }: { iconSize?: 'xs' | 'sm' | 'md' | 'lg' }) => {
    const size = iconSize === 'xs' ? 16 : iconSize === 'sm' ? 20 : iconSize === 'md' ? 24 : 32;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size}>
            <rect width="32" height="32" rx="6" fill="#4b5320" />
            <path d="M10 4h4c6 0 10 4 10 12s-4 12-10 12h-4V4z" fill="#ffffff" />
            <line x1="10" y1="4" x2="10" y2="28" stroke="#ffffff" strokeWidth="2" />
            <line x1="7" y1="10" x2="13" y2="10" stroke="#ffffff" strokeWidth="2" />
            <line x1="7" y1="22" x2="13" y2="22" stroke="#ffffff" strokeWidth="2" />
        </svg>
    );
};

export default DemoGlyphIcon;
