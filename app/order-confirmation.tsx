import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';

// Web-compatible CSS
if (typeof window !== 'undefined') {
  require('../global.css');
}

export default function OrderConfirmationScreen() {
  const [orderNumber] = useState(`GRO${Date.now().toString().slice(-6)}`);
  const [estimatedTime] = useState('30-45 minutes');

  useEffect(() => {
    // Auto-redirect to home after 10 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinueShopping = () => {
    router.replace('/(tabs)/home');
  };

  const handleTrackOrder = () => {
    router.push('/(tabs)/orders');
  };

  return (
    <div style={styles.container}>
      {/* Success Animation */}
      <div style={styles.successSection}>
        <div style={styles.checkmarkContainer}>
          <div style={styles.checkmark}>✓</div>
        </div>
        <h1 style={styles.successTitle}>Order Placed Successfully!</h1>
        <p style={styles.successMessage}>
          Thank you for your order. We're preparing your fresh groceries!
        </p>
      </div>

      {/* Order Details */}
      <div style={styles.orderDetails}>
        <div style={styles.orderCard}>
          <h2 style={styles.orderTitle}>Order Details</h2>
          <div style={styles.orderInfo}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Order Number:</span>
              <span style={styles.infoValue}>#{orderNumber}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Estimated Delivery:</span>
              <span style={styles.infoValue}>{estimatedTime}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Status:</span>
              <span style={styles.statusValue}>Order Confirmed</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={styles.timelineCard}>
          <h3 style={styles.timelineTitle}>Order Timeline</h3>
          <div style={styles.timeline}>
            <div style={styles.timelineItem}>
              <div style={styles.timelineIcon}>✓</div>
              <div style={styles.timelineContent}>
                <p style={styles.timelineText}>Order Placed</p>
                <p style={styles.timelineTime}>Just now</p>
              </div>
            </div>
            <div style={styles.timelineItem}>
              <div style={{...styles.timelineIcon, ...styles.timelineIconPending}}>⏳</div>
              <div style={styles.timelineContent}>
                <p style={styles.timelineText}>Preparing Order</p>
                <p style={styles.timelineTime}>5-10 minutes</p>
              </div>
            </div>
            <div style={styles.timelineItem}>
              <div style={{...styles.timelineIcon, ...styles.timelineIconPending}}>🚚</div>
              <div style={styles.timelineContent}>
                <p style={styles.timelineText}>Out for Delivery</p>
                <p style={styles.timelineTime}>25-35 minutes</p>
              </div>
            </div>
            <div style={styles.timelineItem}>
              <div style={{...styles.timelineIcon, ...styles.timelineIconPending}}>📦</div>
              <div style={styles.timelineContent}>
                <p style={styles.timelineText}>Delivered</p>
                <p style={styles.timelineTime}>30-45 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div style={styles.nextSteps}>
          <h3 style={styles.nextStepsTitle}>What's Next?</h3>
          <div style={styles.stepsList}>
            <div style={styles.step}>
              <span style={styles.stepIcon}>📱</span>
              <span style={styles.stepText}>You'll receive SMS updates on your order status</span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepIcon}>🔔</span>
              <span style={styles.stepText}>Push notifications will keep you informed</span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepIcon}>📞</span>
              <span style={styles.stepText}>Our delivery partner will call before arriving</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button style={styles.trackButton} onClick={handleTrackOrder}>
          Track Order
        </button>
        <button style={styles.continueButton} onClick={handleContinueShopping}>
          Continue Shopping
        </button>
      </div>

      {/* Auto-redirect notice */}
      <div style={styles.autoRedirect}>
        <p style={styles.autoRedirectText}>
          You'll be redirected to home in 10 seconds...
        </p>
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
    padding: '20px',
    alignItems: 'center',
  },
  successSection: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  checkmarkContainer: {
    marginBottom: '24px',
  },
  checkmark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    animation: 'pulse 2s infinite',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 12px 0',
  },
  successMessage: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
    maxWidth: '400px',
    lineHeight: '1.5',
  },
  orderDetails: {
    width: '100%',
    maxWidth: '500px',
    marginBottom: '32px',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  orderTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 16px 0',
  },
  orderInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#666',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  statusValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4CAF50',
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  timelineTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 20px 0',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  timelineIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '16px',
    flexShrink: 0,
  },
  timelineIconPending: {
    backgroundColor: '#e0e0e0',
    color: '#666',
  },
  timelineContent: {
    flex: 1,
  },
  timelineText: {
    fontSize: '14px',
    color: '#333',
    margin: '0 0 4px 0',
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: '12px',
    color: '#666',
    margin: '0',
  },
  nextSteps: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  nextStepsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 16px 0',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stepIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  stepText: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.4',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '400px',
    marginBottom: '20px',
  },
  trackButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#4CAF50',
    border: '2px solid #4CAF50',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  autoRedirect: {
    textAlign: 'center' as const,
  },
  autoRedirectText: {
    fontSize: '12px',
    color: '#999',
    margin: '0',
    fontStyle: 'italic',
  },
};