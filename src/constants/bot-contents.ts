type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    CHART: 2,
    HYBRID_BOTS: 3,
    FREE_BOTS: 4,
    DCIRCLES: 5,
    COPY_TRADING: 6,
    SMART_TRADER: 7,
    DP_TOOLS: 8,
    DTRADER: 9,
    TRADINGVIEW: 10,
    ANALYSIS_TOOL: 11,
    SPEEDBOT: 12,
    // Keep TUTORIAL as a non-active sentinel to avoid index mismatches in legacy checks
    TUTORIAL: 999,
    // Legacy tabs - kept for backward compatibility but redirect to HYBRID_BOTS
    MATCHES: 3,
    HYPERBOT: 3,
    DIFFBOT: 3,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-charts',
    'id-hybrid-bots',
    'id-free-bots',
    'id-dcircles',
    'id-copy-trading',
    'id-smart-trader',
    'id-dp-tools',
    'id-dtrader',
    'id-tradingview',
    'id-analysis-tool',
    'id-speedbot',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
