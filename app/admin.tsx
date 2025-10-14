import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';

// Import CSS for web
if (typeof window !== 'undefined') {
  require('../global.css');
}

import SimpleLoginScreen from '../src/components/auth/SimpleLoginScreen';
import AdminNavigator from '../src/navigation/AdminNavigator';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Import authService dynamically to avoid circular dependencies
        const authService = (await import('../lib/services/authService')).default;
        const currentUser = await authService.getCurrentUser();
        
        console.log('🔍 Admin page auth check:', {
          currentUser,
          hasUser: !!currentUser?.user,
          hasProfile: !!currentUser?.profile,
          userRole: currentUser?.profile?.role,
          userMetadataRole: currentUser?.user?.user_metadata?.role
        });
        
        if (currentUser && currentUser.user) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show admin login screen if not authenticated or not admin
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>Loading...</h1>
          <p style={styles.welcomeSubtitle}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (check both profile and user_metadata)
  const isAdmin = user?.profile?.role === 'admin' || user?.user?.user_metadata?.role === 'admin';
  
  console.log('🔐 Admin access check:', {
    isAuthenticated,
    profileRole: user?.profile?.role,
    metadataRole: user?.user?.user_metadata?.role,
    isAdmin,
    shouldShowLogin: !isAuthenticated || !isAdmin
  });

  if (!isAuthenticated || !isAdmin) {
    return (
      <SimpleLoginScreen 
        onLoginSuccess={() => {
          console.log('🔐 Admin authenticated successfully');
          // Refresh the auth state
          window.location.reload();
        }}
      />
    );
  }

  // Show admin dashboard with tab navigation
  return <AdminNavigator />;

}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: '15px 20px',
    paddingTop: '50px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    color: '#ffffff',
  },
  icon: {
    marginRight: '5px',
  },
  logoutText: {
    fontSize: '14px',
    fontWeight: '500',
  },
  welcomeSection: {
    backgroundColor: '#ffffff',
    padding: '20px',
    margin: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 5px 0',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 5px 0',
  },
  roleText: {
    fontSize: '14px',
    color: '#4CAF50',
    fontWeight: '500',
    margin: '0',
  },
  adminGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between',
    padding: '0 20px',
    gap: '15px',
  },
  adminCard: {
    backgroundColor: '#ffffff',
    width: 'calc(50% - 7.5px)',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  cardIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '10px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    margin: '10px 0 5px 0',
  },
  cardDescription: {
    fontSize: '12px',
    color: '#666',
    margin: '0',
  },
  statsSection: {
    backgroundColor: '#ffffff',
    margin: '20px',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 15px 0',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  statItem: {
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#4CAF50',
    margin: '0',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0 0 0',
  },
};