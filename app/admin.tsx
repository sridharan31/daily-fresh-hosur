import React, { useEffect, useState } from 'react';

// Import CSS for web
if (typeof window !== 'undefined') {
  require('../global.css');
}

import SimpleLoginScreen from '../src/components/auth/SimpleLoginScreen';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Import authService dynamically to avoid circular dependencies
        const { default: authService } = await import('../lib/services/authService');
        
        // Check if there's an authenticated session
        const authUser = await authService.getCurrentUser();
        
        if (authUser) {
          // User is authenticated
          setUser(authUser);
          setIsAuthenticated(true);
        } else {
          // No authenticated session
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login success
  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Import authService dynamically
      const { default: authService } = await import('../lib/services/authService');
      
      // Sign out the user
      await authService.signOut();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SimpleLoginScreen 
        onLoginSuccess={() => handleLoginSuccess(null)}
      />
    );
  }

  // Show admin navigation when authenticated
 return <AdminNavigator />;
}

import { StyleSheet } from '../src/components/ui/WebCompatibleComponents';
import AdminNavigator from '../src/navigation/AdminNavigator';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f7f9',
  },
  header: {
    marginBottom: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeaderText: {
    color: '#666',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    color: '#666',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stat: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  menu: {
    marginTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4f9',
    textAlign: 'center',
    lineHeight: 40,
    marginRight: 16,
    fontSize: 18,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc3545',
    marginTop: 16,
    textAlign: 'center',
  }
});