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

const AdminPanel: React.FC = () => {
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'bots' | 'channels' | 'settings'>('bots');
  const [config, setConfig] = useState<AppConfig>({
    bots: [],
    channels: { whatsapp: '', telegram: '', email: '', discord: '' },
    appName: 'PulseTrader',
    supportEmail: 'support@pulsetrader.com'
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setMessage('Configuration saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error saving configuration');
      console.error(error);
    }
  };

  const addBot = () => {
    const newBot: Bot = {
      id: `bot-${Date.now()}`,
      name: 'New Bot',
      description: '',
      icon: ''
    };
    setConfig({
      ...config,
      bots: [...config.bots, newBot]
    });
  };

  const updateBot = (id: string, updates: Partial<Bot>) => {
    setConfig({
      ...config,
      bots: config.bots.map(bot => bot.id === id ? { ...bot, ...updates } : bot)
    });
  };

  const deleteBot = (id: string) => {
    setConfig({
      ...config,
      bots: config.bots.filter(bot => bot.id !== id)
    });
  };

  const updateChannel = (channel: keyof Channels, value: string) => {
    setConfig({
      ...config,
      channels: { ...config.channels, [channel]: value }
    });
  };

  if (loading) {
    return <div className="admin-panel"><p>Loading...</p></div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div className="header-actions">
          <button className="save-btn" onClick={saveConfig}>Save All Changes</button>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {message && <div className="message-banner">{message}</div>}

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'bots' ? 'active' : ''}`}
          onClick={() => setActiveTab('bots')}
        >
          Bot Types
        </button>
        <button 
          className={`tab-btn ${activeTab === 'channels' ? 'active' : ''}`}
          onClick={() => setActiveTab('channels')}
        >
          Contact Channels
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="admin-content">
        {/* BOTS TAB */}
        {activeTab === 'bots' && (
          <div className="section">
            <h2>Manage Bot Types</h2>
            <button className="add-btn" onClick={addBot}>+ Add New Bot</button>

            <div className="bots-list">
              {config.bots.map(bot => (
                <div key={bot.id} className="bot-card">
                  <input
                    type="text"
                    placeholder="Bot Name"
                    value={bot.name}
                    onChange={(e) => updateBot(bot.id, { name: e.target.value })}
                    className="input-field"
                  />
                  <textarea
                    placeholder="Description"
                    value={bot.description}
                    onChange={(e) => updateBot(bot.id, { description: e.target.value })}
                    className="textarea-field"
                  />
                  <input
                    type="text"
                    placeholder="Icon URL"
                    value={bot.icon || ''}
                    onChange={(e) => updateBot(bot.id, { icon: e.target.value })}
                    className="input-field"
                  />
                  <button 
                    className="delete-btn" 
                    onClick={() => deleteBot(bot.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHANNELS TAB */}
        {activeTab === 'channels' && (
          <div className="section">
            <h2>Contact Channels</h2>
            <div className="channel-form">
              <div className="form-group">
                <label>WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="+1234567890"
                  value={config.channels.whatsapp}
                  onChange={(e) => updateChannel('whatsapp', e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Telegram Handle</label>
                <input
                  type="text"
                  placeholder="@pulsetrader_bot"
                  value={config.channels.telegram}
                  onChange={(e) => updateChannel('telegram', e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="support@example.com"
                  value={config.channels.email}
                  onChange={(e) => updateChannel('email', e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Discord Server</label>
                <input
                  type="text"
                  placeholder="https://discord.gg/..."
                  value={config.channels.discord || ''}
                  onChange={(e) => updateChannel('discord', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="section">
            <h2>Application Settings</h2>
            <div className="channel-form">
              <div className="form-group">
                <label>App Name</label>
                <input
                  type="text"
                  placeholder="PulseTrader"
                  value={config.appName}
                  onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Support Email</label>
                <input
                  type="email"
                  placeholder="support@example.com"
                  value={config.supportEmail}
                  onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
