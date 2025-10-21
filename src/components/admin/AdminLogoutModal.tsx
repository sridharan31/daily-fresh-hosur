import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { logoutUser as logout } from '../../../lib/supabase/store/actions/authActions';
import Button from '../common/Button';

interface AdminLogoutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AdminLogoutModal: React.FC<AdminLogoutModalProps> = ({ 
  visible, 
  onClose 
}) => {
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout());
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sign Out</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to sign out of the admin panel?
          </Text>
          
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.modalButton}
              disabled={isLoggingOut}
            />
            <Button
              title="Sign Out"
              onPress={handleLogout}
              loading={isLoggingOut}
              style={styles.modalLogoutButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  modalLogoutButton: {
    flex: 1,
    backgroundColor: '#dc3545',
  },
});

// Default export for Expo Router compatibility
export default AdminLogoutModal;