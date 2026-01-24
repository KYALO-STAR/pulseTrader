import React from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLogin from '@/pages/admin-login/admin-login';
import AdminPanel from '@/pages/admin-panel/admin-panel';

const LoadingScreen: React.FC = () => (
    <div className='loading-screen'>
        <p>Loading...</p>
    </div>
);

const AdminAppContent: React.FC = () => {
    const { isAuthenticated, loading } = useAdminAuth();

    if (loading) return <LoadingScreen />;
    return isAuthenticated ? <AdminPanel /> : <AdminLogin />;
};

const AdminApp: React.FC = () => (
    <AdminAuthProvider>
        <AdminAppContent />
    </AdminAuthProvider>
);

export default AdminApp;
