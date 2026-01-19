import React from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLogin from '@/pages/admin-login/admin-login';
import AdminPanel from '@/pages/admin-panel/admin-panel';

/**
 * AdminAppContent: Renders either login page or admin panel based on auth state
 */
const AdminAppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0e0c',
        color: '#fff'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <AdminPanel /> : <AdminLogin />;
};

/**
 * AdminApp: Standalone admin application
 * Wrap with authentication provider and render the appropriate component
 */
const AdminApp: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminAppContent />
    </AdminAuthProvider>
  );
};

export default AdminApp;
