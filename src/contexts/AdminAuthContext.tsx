import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
    isAuthenticated: boolean;
    login: (password: string) => boolean;
    logout: () => void;
    loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Admin password - change this to your desired key
const ADMIN_PASSWORD = 'PulseTrader@2024';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if already authenticated on mount
    useEffect(() => {
        const adminToken = localStorage.getItem('admin_auth_token');
        if (adminToken === 'authenticated') {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (password: string): boolean => {
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem('admin_auth_token', 'authenticated');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('admin_auth_token');
        setIsAuthenticated(false);
    };

    return (
        <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};
