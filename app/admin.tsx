import { router } from 'expo-router';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import CSS for web
if (typeof window !== 'undefined') {
  require('../global.css');
}

import { AppDispatch, RootState } from '../lib/store';
import { logout } from '../lib/store/slices/authSlice';
import { DailyFreshLogo } from '../src/components/branding/DailyFreshLogo';

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      router.replace('/');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <DailyFreshLogo size="medium" />
        <button style={styles.logoutButton} onClick={handleLogout}>
          <span style={styles.icon}>🔓</span>
          <span style={styles.logoutText}>Logout</span>
        </button>
      </div>

      {/* Welcome Section */}
      <div style={styles.welcomeSection}>
        <h1 style={styles.welcomeTitle}>Welcome, Admin!</h1>
        <p style={styles.welcomeSubtitle}>
          {user?.email || 'admin@groceryapp.com'}
        </p>
        <p style={styles.roleText}>Role: {user?.role || 'admin'}</p>
      </div>

      {/* Admin Functions */}
      <div style={styles.adminGrid}>
        <div style={styles.adminCard}>
          <span style={styles.cardIcon}>👥</span>
          <h3 style={styles.cardTitle}>User Management</h3>
          <p style={styles.cardDescription}>Manage customers and staff</p>
        </div>

        <div style={styles.adminCard}>
          <span style={styles.cardIcon}>📦</span>
          <h3 style={styles.cardTitle}>Product Management</h3>
          <p style={styles.cardDescription}>Add and edit products</p>
        </div>

        <div style={styles.adminCard}>
          <span style={styles.cardIcon}>🛒</span>
          <h3 style={styles.cardTitle}>Order Management</h3>
          <p style={styles.cardDescription}>View and process orders</p>
        </div>

        <div style={styles.adminCard}>
          <span style={styles.cardIcon}>📊</span>
          <h3 style={styles.cardTitle}>Analytics</h3>
          <p style={styles.cardDescription}>Sales and performance data</p>
        </div>

        <div style={styles.adminCard}>
          <span style={styles.cardIcon}>🚛</span>
          <h3 style={styles.cardTitle}>Delivery Management</h3>
          <p style={styles.cardDescription}>Track deliveries and drivers</p>
        </div>

        <div style={styles.adminCard}>
          <span style={styles.cardIcon}>⚙️</span>
          <h3 style={styles.cardTitle}>Settings</h3>
          <p style={styles.cardDescription}>App configuration</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsSection}>
        <h2 style={styles.statsTitle}>Quick Stats</h2>
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <p style={styles.statNumber}>142</p>
            <p style={styles.statLabel}>Total Orders</p>
          </div>
          <div style={styles.statItem}>
            <p style={styles.statNumber}>28</p>
            <p style={styles.statLabel}>Active Users</p>
          </div>
          <div style={styles.statItem}>
            <p style={styles.statNumber}>₹12,450</p>
            <p style={styles.statLabel}>Today's Sales</p>
          </div>
        </div>
      </div>
    </div>
  );
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