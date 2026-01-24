import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'public', 'config.json');

const defaultConfig = {
    bots: [
        {
            id: 'bot-1',
            name: 'SpeedBots',
            description: 'Automated trading bots with predefined strategies',
            icon: 'LegacyMenuApps2pxIcon',
        },
        {
            id: 'bot-2',
            name: 'Bot Builder',
            description: 'Create custom trading bots with visual builder',
            icon: 'LegacyBuild2pxIcon',
        },
        {
            id: 'bot-3',
            name: 'Copy Trading',
            description: 'Copy trades from successful traders',
            icon: 'LegacyHomeNewIcon',
        },
    ],
    channels: {
        whatsapp: '+1234567890',
        telegram: '@pulsetrader_bot',
        email: 'support@pulsetrader.com',
        discord: 'https://discord.gg/pulsetrader',
    },
    appName: 'PulseTrader',
    supportEmail: 'support@pulsetrader.com',
};

export function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
    return defaultConfig;
}

export function saveConfig(config: any) {
    try {
        const dir = path.dirname(CONFIG_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}
