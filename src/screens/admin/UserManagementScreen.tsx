import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../lib/supabase/store';
import {
    createAdminUser,
    deleteAdminUser,
    fetchAdminRoles,
    fetchAdminUsers,
    updateAdminUser,
} from '../../../lib/supabase/store/actions/adminUserActions';
import { RootState } from '../../../lib/supabase/store/rootReducer';
import { ADMIN_ROLES, AdminRole, AdminUserWithRole, hasPermission } from '../../../lib/types/adminRoles';
import PermissionGate from '../../components/admin/PermissionGate';

// Mock data for admin users
const MOCK_ADMIN_USERS: AdminUserWithRole[] = [
  {
    id: '1',
    email: 'admin@dailyfreshhosur.com',
    firstName: 'Admin',
    lastName: 'User',
    role: ADMIN_ROLES.find(role => role.type === 'super_admin') as AdminRole,
    isActive: true,
    lastLogin: '2025-10-15T08:30:00.000Z',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    email: 'manager@dailyfreshhosur.com',
    firstName: 'Store',
    lastName: 'Manager',
    role: ADMIN_ROLES.find(role => role.type === 'manager') as AdminRole,
    isActive: true,
    lastLogin: '2025-10-17T14:45:00.000Z',
    createdAt: '2025-03-15T00:00:00.000Z',
  },
  {
    id: '3',
    email: 'content@dailyfreshhosur.com',
    firstName: 'Content',
    lastName: 'Editor',
    role: ADMIN_ROLES.find(role => role.type === 'content_editor') as AdminRole,
    isActive: true,
    lastLogin: '2025-10-16T11:20:00.000Z',
    createdAt: '2025-05-10T00:00:00.000Z',
  },
  {
    id: '4',
    email: 'sales@dailyfreshhosur.com',
    firstName: 'Sales',
    lastName: 'Representative',
    role: ADMIN_ROLES.find(role => role.type === 'sales_agent') as AdminRole,
    isActive: false,
    lastLogin: '2025-09-28T09:15:00.000Z',
    createdAt: '2025-06-20T00:00:00.000Z',
  },
  {
    id: '5',
    email: 'support@dailyfreshhosur.com',
    firstName: 'Customer',
    lastName: 'Support',
    role: ADMIN_ROLES.find(role => role.type === 'support_staff') as AdminRole,
    isActive: true,
    lastLogin: '2025-10-18T10:05:00.000Z',
    createdAt: '2025-07-05T00:00:00.000Z',
  },
];

const UserManagementScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminUsers, currentUser, loading } = useSelector((state: RootState) => state.admin);
  
  const [users, setUsers] = useState<AdminUserWithRole[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserWithRole | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch admin users when component mounts
  useEffect(() => {
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminRoles());
  }, [dispatch]);
  
  // Fetch admin users when component mounts
  useEffect(() => {
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminRoles());
  }, [dispatch]);

  // Update local state when adminUsers changes in Redux store
  useEffect(() => {
    setUsers(adminUsers);
  }, [adminUsers]);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roleId: 'manager',
    isActive: true,
  });
  
  // Check if current user has permission to manage users
  const canManageUsers = currentUser ? hasPermission(currentUser, 'users_manage') : false;
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddUser = async () => {
    if (!canManageUsers) {
      Alert.alert('Permission Denied', 'You do not have permission to add users.');
      return;
    }
    
    setIsLoading(true);
    
    // Validate form
    if (!newUser.email || !newUser.firstName || !newUser.lastName) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Use Redux action to create user
      const resultAction = await dispatch(createAdminUser({
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        roleId: newUser.roleId,
        isActive: newUser.isActive,
      }));
      
      if (createAdminUser.fulfilled.match(resultAction)) {
        // Reset form
        setNewUser({
          email: '',
          firstName: '',
          lastName: '',
          roleId: 'manager',
          isActive: true,
        });
        setIsAddModalVisible(false);
        Alert.alert('Success', 'User added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add user. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleUserStatus = async (userId: string) => {
    if (!canManageUsers) {
      Alert.alert('Permission Denied', 'You do not have permission to modify users.');
      return;
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    try {
      await dispatch(updateAdminUser({
        userId,
        userData: {
          isActive: !user.isActive,
        },
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status.');
    }
  };
  
  const handleEditUser = async () => {
    if (!canManageUsers || !selectedUser) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use Redux action to update user
      const resultAction = await dispatch(updateAdminUser({
        userId: selectedUser.id,
        userData: {
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          roleId: selectedUser.role.id,
          isActive: selectedUser.isActive,
        },
      }));
      
      if (updateAdminUser.fulfilled.match(resultAction)) {
        setIsEditModalVisible(false);
        setSelectedUser(null);
        Alert.alert('Success', 'User updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update user. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = (userId: string) => {
    if (!canManageUsers) {
      Alert.alert('Permission Denied', 'You do not have permission to delete users.');
      return;
    }
    
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteAdminUser(userId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user.');
            }
          }
        }
      ]
    );
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };
  
  const renderUserItem = ({ item }: { item: AdminUserWithRole }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userDetails}>
          <Text style={styles.roleLabel}>
            {item.role.name}
          </Text>
          <Text style={styles.lastLoginText}>
            Last login: {formatDate(item.lastLogin)}
          </Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Active</Text>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggleUserStatus(item.id)}
            disabled={!canManageUsers}
          />
        </View>
        
        {currentUser && (
          <PermissionGate user={currentUser} permission="users_manage">
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  setSelectedUser(item);
                  setIsEditModalVisible(true);
                }}
              >
                <Icon name="edit" size={20} color="#2196F3" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(item.id)}
              >
                <Icon name="delete" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </PermissionGate>
        )}
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        {currentUser && (
          <PermissionGate user={currentUser} permission="users_manage">
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+ Add User</Text>
            </TouchableOpacity>
          </PermissionGate>
        )}
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item: AdminUserWithRole) => item.id}
          style={styles.userList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found</Text>
          }
        />
      )}
      
      {/* Add User Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New User</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={newUser.email}
                onChangeText={(text: string) => setNewUser({...newUser, email: text})}
                placeholder="Enter email address"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newUser.firstName}
                  onChangeText={(text: string) => setNewUser({...newUser, firstName: text})}
                  placeholder="First name"
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newUser.lastName}
                  onChangeText={(text: string) => setNewUser({...newUser, lastName: text})}
                  placeholder="Last name"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Role *</Text>
              <ScrollView style={styles.roleSelector} horizontal showsHorizontalScrollIndicator={false}>
                {ADMIN_ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleOption,
                      newUser.roleId === role.id && styles.selectedRole
                    ]}
                    onPress={() => setNewUser({...newUser, roleId: role.id})}
                  >
                    <Text style={[
                      styles.roleText,
                      newUser.roleId === role.id && styles.selectedRoleText
                    ]}>
                      {role.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusToggle}>
                <Text>Inactive</Text>
                <Switch
                  value={newUser.isActive}
                  onValueChange={(value: boolean) => setNewUser({...newUser, isActive: value})}
                  style={styles.switch}
                />
                <Text>Active</Text>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddUser}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Add User</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Edit User Modal */}
      <Modal
        visible={isEditModalVisible && selectedUser !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        {selectedUser && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit User</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: '#f0f0f0' }]}
                  value={selectedUser.email}
                  editable={false}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedUser.firstName}
                    onChangeText={(text: string) => setSelectedUser({...selectedUser, firstName: text})}
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedUser.lastName}
                    onChangeText={(text: string) => setSelectedUser({...selectedUser, lastName: text})}
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <ScrollView style={styles.roleSelector} horizontal showsHorizontalScrollIndicator={false}>
                  {ADMIN_ROLES.map((role) => (
                    <TouchableOpacity
                      key={role.id}
                      style={[
                        styles.roleOption,
                        selectedUser.role.id === role.id && styles.selectedRole
                      ]}
                      onPress={() => setSelectedUser({
                        ...selectedUser,
                        role: { ...selectedUser.role, id: role.id, name: role.name, type: role.type }
                      })}
                    >
                      <Text style={[
                        styles.roleText,
                        selectedUser.role.id === role.id && styles.selectedRoleText
                      ]}>
                        {role.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusToggle}>
                  <Text>Inactive</Text>
                  <Switch
                    value={selectedUser.isActive}
                    onValueChange={(value: boolean) => setSelectedUser({...selectedUser, isActive: value})}
                    style={styles.switch}
                  />
                  <Text>Active</Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleEditUser}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userList: {
    flex: 1,
  },
  userItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleLabel: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  lastLoginText: {
    fontSize: 12,
    color: '#757575',
  },
  userActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#757575',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
  },
  roleSelector: {
    flexDirection: 'row',
    maxHeight: 40,
  },
  roleOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedRole: {
    backgroundColor: '#2196F3',
  },
  roleText: {
    color: '#333',
  },
  selectedRoleText: {
    color: 'white',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  switch: {
    marginHorizontal: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default UserManagementScreen;