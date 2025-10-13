import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { useNotification } from '../../hooks/useNotification';

const { width } = Dimensions.get('window');

interface TwoFactorSetup {
  isEnabled: boolean;
  secret?: string;
  backupCodes?: string[];
  qrCodeUrl?: string;
}

const AdminTwoFactorScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'verify' | 'setup' | 'backup'>('verify');
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup>({
    isEnabled: false,
  });

  // Mock 2FA setup data (replace with actual API calls)
  const mock2FAData = {
    secret: 'JBSWY3DPEHPK3PXP',
    qrCodeUrl: 'https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/GroceryApp:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GroceryApp',
    backupCodes: [
      '12345-67890',
      '09876-54321',
      '11111-22222',
      '33333-44444',
      '55555-66666',
    ],
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      // Mock API call to generate 2FA setup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTwoFactorSetup({
        isEnabled: false,
        secret: mock2FAData.secret,
        qrCodeUrl: mock2FAData.qrCodeUrl,
      });
      setSetupStep('setup');
      
      showNotification('2FA setup initiated. Please scan the QR code with your authenticator app.', 'success');
    } catch (error) {
      showNotification('Failed to initiate 2FA setup. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showNotification('Please enter a valid 6-digit code', 'error');
      return;
    }

    setLoading(true);
    try {
      // Mock API call to verify 2FA code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful verification
      if (verificationCode === '123456') {
        setTwoFactorSetup(prev => ({
          ...prev,
          isEnabled: true,
          backupCodes: mock2FAData.backupCodes,
        }));
        setSetupStep('backup');
        showNotification('2FA has been successfully enabled!', 'success');
      } else {
        showNotification('Invalid verification code. Please try again.', 'error');
      }
    } catch (error) {
      showNotification('Verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    // Show confirmation notification first
    showNotification('Are you sure you want to disable 2FA? This will reduce your account security.', 'warning');
    
    // For now, we'll directly proceed with disabling
    // In a real app, you'd want a proper confirmation modal
    setLoading(true);
    try {
      // Mock API call to disable 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorSetup({ isEnabled: false });
      setSetupStep('verify');
      showNotification('2FA has been disabled', 'success');
    } catch (error) {
      showNotification('Failed to disable 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStatus = () => (
    <Card style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Icon 
          name={twoFactorSetup.isEnabled ? 'verified-user' : 'security'} 
          size={24} 
          color={twoFactorSetup.isEnabled ? '#4CAF50' : '#FF9800'} 
        />
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>Two-Factor Authentication</Text>
          <Text style={[
            styles.statusText,
            { color: twoFactorSetup.isEnabled ? '#4CAF50' : '#FF9800' }
          ]}>
            {twoFactorSetup.isEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
      </View>
      <Text style={styles.statusDescription}>
        {twoFactorSetup.isEnabled 
          ? 'Your account is protected with two-factor authentication'
          : 'Enable 2FA to add an extra layer of security to your admin account'
        }
      </Text>
    </Card>
  );

  const renderSetupStep = () => {
    switch (setupStep) {
      case 'verify':
        return (
          <Card style={styles.setupCard}>
            <Text style={styles.setupTitle}>Enable Two-Factor Authentication</Text>
            <Text style={styles.setupDescription}>
              Secure your admin account with an additional layer of protection. 
              You'll need an authenticator app like Google Authenticator or Authy.
            </Text>
            <Button
              title="Enable 2FA"
              onPress={handleEnable2FA}
              loading={loading}
              style={styles.enableButton}
            />
          </Card>
        );

      case 'setup':
        return (
          <Card style={styles.setupCard}>
            <Text style={styles.setupTitle}>Scan QR Code</Text>
            <Text style={styles.setupDescription}>
              1. Open your authenticator app
              {'\n'}2. Scan the QR code below
              {'\n'}3. Enter the 6-digit code from your app
            </Text>
            
            {/* QR Code placeholder */}
            <View style={styles.qrCodeContainer}>
              <View style={styles.qrCodePlaceholder}>
                <Icon name="qr-code-2" size={120} color="#ccc" />
                <Text style={styles.qrCodeText}>QR Code</Text>
              </View>
            </View>
            
            {/* Manual entry option */}
            <View style={styles.manualEntry}>
              <Text style={styles.manualEntryTitle}>Manual Entry Code:</Text>
              <Text style={styles.secretCode}>{twoFactorSetup.secret}</Text>
            </View>

            <View style={styles.verificationInput}>
              <Input
                placeholder="Enter 6-digit verification code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <Button
              title="Verify and Enable"
              onPress={handleVerify2FA}
              loading={loading}
              disabled={verificationCode.length !== 6}
              style={styles.verifyButton}
            />
          </Card>
        );

      case 'backup':
        return (
          <Card style={styles.setupCard}>
            <Text style={styles.setupTitle}>Save Backup Codes</Text>
            <Text style={styles.setupDescription}>
              Store these backup codes in a safe place. You can use them to access your account 
              if you lose your device.
            </Text>
            
            <View style={styles.backupCodesContainer}>
              {twoFactorSetup.backupCodes?.map((code, index) => (
                <Text key={index} style={styles.backupCode}>
                  {code}
                </Text>
              ))}
            </View>

            <View style={styles.backupWarning}>
              <Icon name="warning" size={20} color="#FF9800" />
              <Text style={styles.warningText}>
                These codes will only be shown once. Save them now!
              </Text>
            </View>

            <Button
              title="I've Saved My Backup Codes"
              onPress={() => setSetupStep('verify')}
              style={styles.completeButton}
            />
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Security Settings</Text>
          <Text style={styles.subtitle}>
            Manage your account security and two-factor authentication
          </Text>
        </View>

        {renderCurrentStatus()}

        {!twoFactorSetup.isEnabled ? (
          renderSetupStep()
        ) : (
          <Card style={styles.managementCard}>
            <Text style={styles.managementTitle}>Manage 2FA</Text>
            <View style={styles.managementOptions}>
              <Button
                title="Regenerate Backup Codes"
                onPress={() => showNotification('Feature coming soon', 'info')}
                variant="outline"
                style={styles.managementButton}
              />
              <Button
                title="Disable 2FA"
                onPress={handleDisable2FA}
                variant="outline"
                style={{
                  ...styles.managementButton,
                  borderColor: '#F44336',
                }}
              />
            </View>
          </Card>
        )}

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={20} color="#2196F3" />
            <Text style={styles.infoTitle}>Security Tips</Text>
          </View>
          <Text style={styles.infoText}>
            • Use a secure authenticator app like Google Authenticator or Authy{'\n'}
            • Keep your backup codes in a safe, offline location{'\n'}
            • Don't share your 2FA codes with anyone{'\n'}
            • Regularly review your account security settings
          </Text>
        </Card>
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
  statusCard: {
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  setupCard: {
    marginBottom: 24,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  setupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  enableButton: {
    backgroundColor: '#4CAF50',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  qrCodeText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  manualEntry: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  manualEntryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  secretCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  verificationInput: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 4,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
  },
  backupCodesContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  backupCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 8,
    width: '48%',
    textAlign: 'center',
  },
  backupWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  managementCard: {
    marginBottom: 24,
  },
  managementTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  managementOptions: {
    gap: 12,
  },
  managementButton: {
    marginBottom: 0,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default AdminTwoFactorScreen;