import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Bot {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Channels {
  whatsapp: string;
  telegram: string;
  email: string;
  discord?: string;
}

export interface AppConfig {
  bots: Bot[];
  channels: Channels;
  appName: string;
  supportEmail: string;
}

const defaultConfig: AppConfig = {
  bots: [],
  channels: { whatsapp: '', telegram: '', email: '', discord: '' },
  appName: 'PulseTrader',
  supportEmail: 'support@pulsetrader.com'
};

interface ConfigContextType {
  config: AppConfig;
  loading: boolean;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const refreshConfig = async () => {
    try {
      const response = await fetch('/config.json');
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

  useEffect(() => {
    refreshConfig();
    // Optionally poll for changes every 30 seconds
    const interval = setInterval(refreshConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, refreshConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};
