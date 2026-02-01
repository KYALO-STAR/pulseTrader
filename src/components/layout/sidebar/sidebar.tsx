import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import {
    LegacyChartsIcon,
    LegacyClose2pxIcon,
    LegacyHomeNewIcon,
    LegacyIndicatorActiveIcon,
    LegacyMenuApps2pxIcon,
    LegacyMenuHamburger2pxIcon,
    LegacyProfitTableIcon,
    LegacyReportsIcon,
    LegacyTraderSHubIcon,
    LegacyTrendUpIcon,
} from '@deriv/quill-icons/Legacy';
import './sidebar.scss';

interface NavItem {
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/?tab=dashboard',
        icon: <LegacyHomeNewIcon height='20px' width='20px' />,
    },
    {
        id: 'bot-builder',
        label: 'Bot Builder',
        path: '/?tab=bot-builder',
        icon: <LegacyMenuApps2pxIcon height='20px' width='20px' />,
    },
    {
        id: 'charts',
        label: 'Charts',
        path: '/?tab=charts',
        icon: <LegacyChartsIcon height='20px' width='20px' />,
    },
    {
        id: 'speedbots',
        label: 'SpeedBots',
        path: '/?tab=speedbots',
        icon: <LegacyIndicatorActiveIcon height='20px' width='20px' />,
    },
    {
        id: 'free-bots',
        label: 'Free Bots',
        path: '/?tab=free-bots',
        icon: <LegacyReportsIcon height='20px' width='20px' />,
    },
    {
        id: 'dcircles',
        label: 'Dcircles',
        path: '/?tab=dcircles',
        icon: <LegacyProfitTableIcon height='20px' width='20px' />,
    },
    {
        id: 'copy-trading',
        label: 'Copy Trading',
        path: '/?tab=copy-trading',
        icon: <LegacyTraderSHubIcon height='20px' width='20px' />,
    },
    {
        id: 'smart-trader',
        label: 'Smart Trader',
        path: '/?tab=smart-trader',
        icon: <LegacyTrendUpIcon height='20px' width='20px' />,
    },
];

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'dashboard';
    });
    const navigate = useNavigate();

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Track URL changes to update active tab
    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            setActiveTab(params.get('tab') || 'dashboard');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleNavClick = (path: string, tabId: string) => {
        setActiveTab(tabId);
        navigate(path);
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Render navigation items
    const NavList = (
        <ul className='sidebar__list'>
            {NAV_ITEMS.map(item => (
                <li key={item.id}>
                    <button
                        className={clsx('sidebar__item', {
                            'sidebar__item--active': activeTab === item.id,
                        })}
                        onClick={() => handleNavClick(item.path, item.id)}
                    >
                        <span className='sidebar__icon'>{item.icon}</span>
                        <span className='sidebar__label'>{item.label}</span>
                    </button>
                </li>
            ))}
        </ul>
    );

    return (
        <>
            {isMobile && (
                <button
                    className='sidebar__hamburger'
                    onClick={toggleMenu}
                    aria-label='Toggle navigation'
                    aria-expanded={isOpen}
                >
                    <LegacyMenuHamburger2pxIcon height='20px' width='20px' />
                </button>
            )}

            {isOpen && <div className='sidebar__overlay' onClick={() => setIsOpen(false)} />}

            <nav className={clsx('sidebar', { 'sidebar--open': isOpen })}>
                {isMobile && (
                    <div className='sidebar__header'>
                        <h2 className='sidebar__title'>Menu</h2>
                        <button className='sidebar__close' onClick={() => setIsOpen(false)} aria-label='Close menu'>
                            <LegacyClose2pxIcon height='20px' width='20px' />
                        </button>
                    </div>
                )}
                {NavList}
            </nav>
        </>
    );
};

export default Sidebar;
