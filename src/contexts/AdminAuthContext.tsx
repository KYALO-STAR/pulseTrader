import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient'; // Import supabase client

interface AdminAuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
                // Here you would ideally check if the user has an 'admin' role.
                // For now, any logged-in user is considered authenticated for the admin panel.
                setIsAuthenticated(true);
            }
            setLoading(false);
        };

        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsAuthenticated(true);
                // Additional role check here if needed:
                // const isAdmin = session.user.app_metadata.roles?.includes('admin');
                // setIsAuthenticated(isAdmin);
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false); // Ensure loading is false after any state change
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error('Supabase Login Error:', error.message);
            setLoading(false);
            return false;
        }
        // After successful login, the onAuthStateChange listener will update isAuthenticated
        // Here you can also check for specific user roles from data.user.app_metadata
        setLoading(false);
        return data.session !== null;
    };

    const logout = async (): Promise<void> => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Supabase Logout Error:', error.message);
        }
        setLoading(false);
        // onAuthStateChange listener will update isAuthenticated to false
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
