import ReactDOM from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthWrapper } from './app/AuthWrapper';
import { AnalyticsInitializer } from './utils/analytics';
import './styles/index.scss';

AnalyticsInitializer();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <>
        <AuthWrapper />
        <SpeedInsights />
    </>
);
