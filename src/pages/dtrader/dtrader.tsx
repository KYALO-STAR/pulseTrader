import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import IframeWrapper from '@/components/iframe-wrapper';
import { getAppId } from '@/components/shared/utils/config/config';

// Mirrors deriv-insider: build iframe URL with active token/login so DTrader opens authenticated
const Dtrader = observer(() => {
    const [iframeSrc, setIframeSrc] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const buildIframeUrl = useCallback((token: string, loginId: string) => {
        const clientAccountsStr = localStorage.getItem('clientAccounts') || '{}';
        let currency = 'USD';

        try {
            const clientAccounts = JSON.parse(clientAccountsStr);
            const account = clientAccounts[loginId];
            if (account?.currency) {
                currency = account.currency;
            }
        } catch (error) {
            console.error('Error parsing clientAccounts:', error);
        }

        const appId = getAppId() || 107255;

        const params = new URLSearchParams({
            acct1: loginId,
            token1: token,
            cur1: currency,
            lang: 'EN',
            app_id: appId.toString(),
            chart_type: 'area',
            interval: '1t',
            symbol: '1HZ100V',
            trade_type: 'over_under',
            hide_bot: '1',
            bot_disabled: 'true',
            disable_bot: '1',
            no_bot: '1',
            manual_only: '1',
            hide_bot_controls: 'true',
        });

        const url = `https://deriv-dtrader.vercel.app/dtrader?${params.toString()}`;
        setIframeSrc(url);
    }, []);

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const activeLoginId = localStorage.getItem('active_loginid');

        if (authToken && activeLoginId) {
            setIsAuthenticated(true);
            buildIframeUrl(authToken, activeLoginId);
        } else {
            setIsAuthenticated(false);
            setIframeSrc(
                'https://deriv-dtrader.vercel.app/dtrader?chart_type=area&interval=1t&symbol=1HZ100V&trade_type=over_under'
            );
        }
    }, [buildIframeUrl]);

    useEffect(() => {
        const checkAuthAndUpdate = () => {
            const authToken = localStorage.getItem('authToken');
            const activeLoginId = localStorage.getItem('active_loginid');

            if (authToken && activeLoginId) {
                if (!isAuthenticated) {
                    setIsAuthenticated(true);
                }
                buildIframeUrl(authToken, activeLoginId);
            } else if (isAuthenticated) {
                setIsAuthenticated(false);
                setIframeSrc(
                    'https://deriv-dtrader.vercel.app/dtrader?chart_type=area&interval=1t&symbol=1HZ100V&trade_type=over_under'
                );
            }
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken' || e.key === 'active_loginid' || e.key === 'clientAccounts') {
                checkAuthAndUpdate();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(checkAuthAndUpdate, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [isAuthenticated, buildIframeUrl]);

    if (!iframeSrc) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading DTrader...</p>
            </div>
        );
    }

    return <IframeWrapper src={iframeSrc} title='DTrader' className='dtrader-container' />;
});

export default Dtrader;
