import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import './admin-panel.scss';

interface Bot {
    id: string;
    name: string;
    description: string;
    icon?: string;
}

interface Channels {
    whatsapp: string;
    telegram: string;
    email: string;
    discord?: string;
}

interface AppConfig {
    bots: Bot[];
    channels: Channels;
    appName: string;
    supportEmail: string;
}

// ✅ Reusable BotCard component
const BotCard: React.FC<{
    bot: Bot;
    onUpdate: (updates: Partial<Bot>) => void;
    onDelete: () => void;
}> = ({ bot, onUpdate, onDelete }) => (
    <div className='bot-card'>
        <input
            type='text'
            placeholder='Bot Name'
            value={bot.name}
            onChange={e => onUpdate({ name: e.target.value })}
            className='input-field'
        />
        <textarea
            placeholder='Description'
            value={bot.description}
            onChange={e => onUpdate({ description: e.target.value })}
            className='textarea-field'
        />
        <input
            type='text'
            placeholder='Icon URL'
            value={bot.icon || ''}
            onChange={e => onUpdate({ icon: e.target.value })}
            className='input-field'
        />
        <button className='delete-btn' onClick={onDelete}>
            Delete
        </button>
    </div>
);

// ✅ Reusable FormField component
const FormField: React.FC<{
    label: string;
    type?: string;
    value: string;
    placeholder?: string;
    onChange: (val: string) => void;
}> = ({ label, type = 'text', value, placeholder, onChange }) => (
    <div className='form-group'>
        <label>{label}</label>
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            className='input-field'
        />
    </div>
);

const AdminPanel: React.FC = () => {
    const { logout } = useAdminAuth();
    const [activeTab, setActiveTab] = useState<'bots' | 'channels' | 'settings'>('bots');
    const [config, setConfig] = useState<AppConfig>({
        bots: [],
        channels: { whatsapp: '', telegram: '', email: '', discord: '' },
        appName: 'PulseTrader',
        supportEmail: 'support@pulsetrader.com',
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await fetch('/api/admin/config');
            if (response.ok) setConfig(await response.json());
        } catch (error) {
            setMessage('⚠️ Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        setMessage('Saving...');
        try {
            const response = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (response.ok) setMessage('✅ Configuration saved!');
            else setMessage('⚠️ Error saving configuration');
        } catch {
            setMessage('⚠️ Error saving configuration');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const addBot = () =>
        setConfig({
            ...config,
            bots: [...config.bots, { id: `bot-${Date.now()}`, name: 'New Bot', description: '', icon: '' }],
        });

    const updateBot = (id: string, updates: Partial<Bot>) =>
        setConfig({ ...config, bots: config.bots.map(bot => (bot.id === id ? { ...bot, ...updates } : bot)) });

    const deleteBot = (id: string) => setConfig({ ...config, bots: config.bots.filter(bot => bot.id !== id) });

    const updateChannel = (channel: keyof Channels, value: string) =>
        setConfig({ ...config, channels: { ...config.channels, [channel]: value } });

    if (loading)
        return (
            <div className='admin-panel'>
                <p>Loading...</p>
            </div>
        );

    return (
        <div className='admin-panel'>
            <div className='admin-header'>
                <h1>Admin Panel</h1>
                <div className='header-actions'>
                    <button className='save-btn' onClick={saveConfig}>
                        Save All Changes
                    </button>
                    <button className='logout-btn' onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>

            {message && <div className='message-banner'>{message}</div>}

            <div className='admin-tabs'>
                {['bots', 'channels', 'settings'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                    >
                        {tab === 'bots' ? 'Bot Types' : tab === 'channels' ? 'Contact Channels' : 'Settings'}
                    </button>
                ))}
            </div>

            <div className='admin-content'>
                {activeTab === 'bots' && (
                    <div className='section'>
                        <h2>Manage Bot Types</h2>
                        <button className='add-btn' onClick={addBot}>
                            + Add New Bot
                        </button>
                        <div className='bots-list'>
                            {config.bots.map(bot => (
                                <BotCard
                                    key={bot.id}
                                    bot={bot}
                                    onUpdate={updates => updateBot(bot.id, updates)}
                                    onDelete={() => deleteBot(bot.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'channels' && (
                    <div className='section'>
                        <h2>Contact Channels</h2>
                        <FormField
                            label='WhatsApp Number'
                            value={config.channels.whatsapp}
                            onChange={v => updateChannel('whatsapp', v)}
                        />
                        <FormField
                            label='Telegram Handle'
                            value={config.channels.telegram}
                            onChange={v => updateChannel('telegram', v)}
                        />
                        <FormField
                            label='Email'
                            type='email'
                            value={config.channels.email}
                            onChange={v => updateChannel('email', v)}
                        />
                        <FormField
                            label='Discord Server'
                            value={config.channels.discord || ''}
                            onChange={v => updateChannel('discord', v)}
                        />
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className='section'>
                        <h2>Application Settings</h2>
                        <FormField
                            label='App Name'
                            value={config.appName}
                            onChange={v => setConfig({ ...config, appName: v })}
                        />
                        <FormField
                            label='Support Email'
                            type='email'
                            value={config.supportEmail}
                            onChange={v => setConfig({ ...config, supportEmail: v })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
