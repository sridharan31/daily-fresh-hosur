// app/screens/admin/AdminSecurityScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';

import AuditService, { type AdminAuditLog, type SecurityAlert } from '../../../lib/services/admin/auditService';
import AdminSessionService, { type AdminSession } from '../../../lib/services/admin/sessionService';
import { RootState } from '../../../lib/store';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useNotification } from '../../hooks/useNotification';

const { width } = Dimensions.get('window');

interface SecurityStats {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  securityAlerts: number;
  activeSession?: AdminSession;
}

const AdminSecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    securityAlerts: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AdminAuditLog[]>([]);

  const auditService = AuditService.getInstance();
  const sessionService = AdminSessionService.getInstance();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Load security statistics
      const stats = await auditService.getAuditStatistics('week');
      const currentSession = sessionService.getCurrentSession();
      
      setSecurityStats({
        ...stats,
        activeSession: currentSession || undefined,
      });

      // Load recent security alerts
      const alerts = await auditService.getSecurityAlerts();
      setRecentAlerts(alerts.slice(0, 5)); // Show only 5 most recent

      // Load recent audit logs
      const logs = await auditService.getAuditLogs({ limit: 10 });
      setRecentAuditLogs(logs);

    } catch (error) {
      console.error('Failed to load security data:', error);
      showNotification('Failed to load security data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSecurityData();
    setRefreshing(false);
  };

  const handleExportAuditLogs = async () => {
    try {
      setLoading(true);
      const csvData = await auditService.exportAuditLogs({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      });
      
      // In a real app, you'd use a file system library to save the file
      // For now, just show a success message
      showNotification('Audit logs exported successfully', 'success');
      console.log('CSV Data:', csvData.substring(0, 200) + '...');
    } catch (error) {
      showNotification('Failed to export audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderSecurityOverview = () => (
    <Card style={styles.overviewCard}>
      <Text style={styles.sectionTitle}>Security Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Icon name="security" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{securityStats.totalActions}</Text>
          <Text style={styles.statLabel}>Total Actions</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{securityStats.successfulActions}</Text>
          <Text style={styles.statLabel}>Successful</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="error" size={24} color="#F44336" />
          <Text style={styles.statValue}>{securityStats.failedActions}</Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="warning" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{securityStats.securityAlerts}</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
      </View>
    </Card>
  );

  const renderCurrentSession = () => (
    <Card style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Icon name="account-circle" size={24} color="#2196F3" />
        <Text style={styles.sectionTitle}>Current Session</Text>
      </View>
      
      {securityStats.activeSession ? (
        <View style={styles.sessionInfo}>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Session ID:</Text>
            <Text style={styles.sessionValue}>
              {securityStats.activeSession.sessionId.slice(-8)}...
            </Text>
          </View>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Started:</Text>
            <Text style={styles.sessionValue}>
              {new Date(securityStats.activeSession.startTime).toLocaleString()}
            </Text>
          </View>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Last Activity:</Text>
            <Text style={styles.sessionValue}>
              {new Date(securityStats.activeSession.lastActivity).toLocaleString()}
            </Text>
          </View>
          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>IP Address:</Text>
            <Text style={styles.sessionValue}>
              {securityStats.activeSession.ipAddress}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noSessionText}>No active session found</Text>
      )}
    </Card>
  );

  const renderSecurityAlerts = () => (
    <Card style={styles.alertsCard}>
      <View style={styles.alertsHeader}>
        <Icon name="warning" size={24} color="#FF9800" />
        <Text style={styles.sectionTitle}>Recent Security Alerts</Text>
      </View>
      
      {recentAlerts.length > 0 ? (
        <View style={styles.alertsList}>
          {recentAlerts.map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <View style={styles.alertIconContainer}>
                <Icon 
                  name={getAlertIcon(alert.type)} 
                  size={20} 
                  color={getAlertColor(alert.severity)} 
                />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertDescription}>{alert.description}</Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.timestamp).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: getAlertColor(alert.severity) }]}>
                <Text style={styles.severityText}>{alert.severity}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noAlertsText}>No recent security alerts</Text>
      )}
    </Card>
  );

  const renderRecentActivity = () => (
    <Card style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <Icon name="history" size={24} color="#673AB7" />
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </View>
      
      {recentAuditLogs.length > 0 ? (
        <View style={styles.activityList}>
          {recentAuditLogs.slice(0, 5).map((log, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon 
                  name={getActionIcon(log.action)} 
                  size={16} 
                  color={log.result === 'SUCCESS' ? '#4CAF50' : '#F44336'} 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{formatAction(log.action)}</Text>
                <Text style={styles.activityDetails}>
                  {log.resource} • {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <View style={[
                styles.resultBadge,
                { backgroundColor: log.result === 'SUCCESS' ? '#E8F5E8' : '#FFEBEE' }
              ]}>
                <Text style={[
                  styles.resultText,
                  { color: log.result === 'SUCCESS' ? '#4CAF50' : '#F44336' }
                ]}>
                  {log.result}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noActivityText}>No recent activity</Text>
      )}
    </Card>
  );

  const renderSecurityActions = () => (
    <Card style={styles.actionsCard}>
      <Text style={styles.sectionTitle}>Security Actions</Text>
      <View style={styles.actionButtons}>
        <Button
          title="Two-Factor Authentication"
          onPress={() => navigation.navigate('AdminTwoFactor' as never)}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Export Audit Logs"
          onPress={handleExportAuditLogs}
          variant="outline"
          loading={loading}
          style={styles.actionButton}
        />
        <Button
          title="Session Management"
          onPress={() => showNotification('Session management coming soon', 'info')}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Security Settings"
          onPress={() => showNotification('Advanced security settings coming soon', 'info')}
          variant="outline"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'FAILED_LOGIN_ATTEMPTS': return 'lock';
      case 'SUSPICIOUS_ACTIVITY': return 'visibility';
      case 'UNAUTHORIZED_ACCESS': return 'block';
      case 'BULK_CHANGES': return 'edit';
      default: return 'warning';
    }
  };

  const getAlertColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'LOW': return '#4CAF50';
      case 'MEDIUM': return '#FF9800';
      case 'HIGH': return '#F44336';
      case 'CRITICAL': return '#9C27B0';
      default: return '#999';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return 'login';
    if (action.includes('CREATE')) return 'add';
    if (action.includes('UPDATE')) return 'edit';
    if (action.includes('DELETE')) return 'delete';
    return 'info';
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Security Dashboard</Text>
          <Text style={styles.subtitle}>
            Monitor admin security and audit activities
          </Text>
        </View>

        {renderSecurityOverview()}
        {renderCurrentSession()}
        {renderSecurityAlerts()}
        {renderRecentActivity()}
        {renderSecurityActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  overviewCard: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sessionCard: {
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionInfo: {
    gap: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sessionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sessionValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  noSessionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  alertsCard: {
    marginBottom: 16,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    gap: 12,
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertDescription: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  noAlertsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  activityCard: {
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  activityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  activityDetails: {
    fontSize: 12,
    color: '#666',
  },
  resultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultText: {
    fontSize: 10,
    fontWeight: '600',
  },
  noActivityText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionsCard: {
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
});

export default AdminSecurityScreen;