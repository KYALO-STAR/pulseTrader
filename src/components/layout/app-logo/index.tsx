import { useDevice } from '@deriv-com/ui';
import { useState, useEffect } from 'react';

import { LegacyMenuHamburger1pxIcon } from '@deriv/quill-icons/Legacy';
// Custom icons to match uploaded images exactly
import { useTranslations } from '@deriv-com/translations';
import './app-logo.scss';

// Menu Icon for mobile/tablet
const MenuIcon = ({ onClick }: { onClick: () => void }) => (
    <button
        className='app-header__menu-icon-button'
        onClick={onClick}
        type='button'
        aria-label='Open menu'
    >
        <LegacyMenuHamburger1pxIcon iconSize='sm' fill='var(--text-general)' />
    </button>
);

// Deltawave Synthetics Icon Component
const DeltawaveIcon = () => (
    <div className="deltawave-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#60A5FA" stroke="#60A5FA" strokeWidth="1"/>
            <path d="M12 8L13.5 12L18 13.5L13.5 15L12 19L10.5 15L6 13.5L10.5 12L12 8Z" fill="#93C5FD" stroke="#93C5FD" strokeWidth="0.5"/>
        </svg>
    </div>
);

// Ringing Phone Icon Component
const RingingPhoneIcon = () => {
    const [isRinging, setIsRinging] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsRinging(prev => !prev);
        }, 1000); // Ring every second

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`phone-icon ${isRinging ? 'ringing' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9844 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.04207 3.23945 9.11999 3.72C9.28562 4.68007 9.56683 5.62273 9.95999 6.53C10.0676 6.79792 10.1118 7.08784 10.0894 7.37682C10.067 7.6658 9.97842 7.94674 9.82999 8.2L8.82999 9.8C9.90742 11.9882 11.6117 13.6925 13.8 14.77L15.4 13.17C15.6532 13.0216 15.9342 12.933 16.2232 12.9106C16.5122 12.8882 16.8021 12.9324 17.07 13.04C17.9773 13.4332 18.9199 13.7144 19.88 13.88C20.3696 13.9585 20.8148 14.2032 21.1315 14.5715C21.4482 14.9399 21.6158 15.4081 21.61 15.89L22 16.92Z" fill="#60A5FA"/>
            </svg>
        </div>
    );
};

export const AppLogo = ({ onMenuClick }: { onMenuClick?: () => void }) => {
    const { isDesktop } = useDevice();
    const { localize } = useTranslations();

    // Header icons handlers
    const handleWhatsAppClick = () => {
        // Open WhatsApp or live chat
        const whatsappUrl = 'https://wa.me/35699578341'; // Deriv WhatsApp number
        window.open(whatsappUrl, '_blank');
    };

    const handleRefreshClick = () => {
        window.location.reload();
    };

    return (
        <div className='app-header__logo-container'>
            {/* On mobile/tablet: Menu icon takes the place of Deriv logo */}
            {!isDesktop && onMenuClick && (
                <MenuIcon onClick={onMenuClick} />
            )}

            {/* Deltawave Synthetics Branding */}
            <div className="deltawave-branding">
                <DeltawaveIcon />
                <span className="brand-text">Deltawave Synthetics</span>
                <RingingPhoneIcon />
            </div>
        </div>
    );
};
