import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import LoadingScreen from '../../components/common/LoadingScreen';
import { Notification } from '../../components/common/Notification';
import { useNotification } from '../../hooks/useNotification';

// Define admin roles and permissions
export const ADMIN_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Administrator',
    permissions: ['ALL'],
    description: 'Full system access and user management',
  },
  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    permissions: ['PRODUCTS', 'INVENTORY', 'SUPPLIERS', 'CATEGORIES'],
    description: 'Manage products, stock, and suppliers',
  },
  ORDER_MANAGER: {
    name: 'Order Manager',
    permissions: ['ORDERS', 'CUSTOMERS', 'DELIVERY', 'REFUNDS'],
    description: 'Handle orders, customers, and delivery',
  },
  CONTENT_MANAGER: {
    name: 'Content Manager',
    permissions: ['CONTENT', 'PROMOTIONS', 'NOTIFICATIONS', 'REVIEWS'],
    description: 'Manage content, promotions, and communications',
  },
  ANALYTICS_VIEWER: {
    name: 'Analytics Viewer',
    permissions: ['ANALYTICS', 'REPORTS'],
    description: 'View reports and analytics only',
  },
} as const;

export type AdminRole = keyof typeof ADMIN_ROLES;

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  createdBy: string;
  permissions: readonly string[];
}

interface AdminUserFormData {
  email: string;
  name: string;
  role: AdminRole;
  password: string;
  confirmPassword: string;
  isActive: boolean;
}

export const AdminUserManagementScreen: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<AdminRole | 'ALL'>('ALL');
  
  const notification = useNotification();

  const [formData, setFormData] = useState<AdminUserFormData>({
    email: '',
    name: '',
    role: 'INVENTORY_MANAGER',
    password: '',
    confirmPassword: '',
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Partial<AdminUserFormData>>({});

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockUsers: AdminUser[] = [
        {
          id: '1',
          email: 'admin@grocery.com',
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date('2024-01-01'),
          createdBy: 'system',
          permissions: [...ADMIN_ROLES.SUPER_ADMIN.permissions],
        },
        {
          id: '2',
          email: 'inventory@grocery.com',
          name: 'John Smith',
          role: 'INVENTORY_MANAGER',
          isActive: true,
          lastLogin: new Date('2024-09-29'),
          createdAt: new Date('2024-02-15'),
          createdBy: '1',
          permissions: [...ADMIN_ROLES.INVENTORY_MANAGER.permissions],
        },
        {
          id: '3',
          email: 'orders@grocery.com',
          name: 'Sarah Johnson',
          role: 'ORDER_MANAGER',
          isActive: false,
          lastLogin: new Date('2024-09-20'),
          createdAt: new Date('2024-03-10'),
          createdBy: '1',
          permissions: [...ADMIN_ROLES.ORDER_MANAGER.permissions],
        },
      ];
      setAdminUsers(mockUsers);
    } catch (error) {
      notification.showError('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<AdminUserFormData> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    } else if (adminUsers.some(user => user.email === formData.email && user.id !== selectedUser?.id)) {
      errors.email = 'Email already exists';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!showEditModal) { // Only validate password for new users
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      const newUser: AdminUser = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        role: formData.role,
        isActive: formData.isActive,
        createdAt: new Date(),
        createdBy: 'current-admin-id', // Replace with actual current admin ID
        permissions: [...ADMIN_ROLES[formData.role].permissions],
      };

      setAdminUsers(prev => [...prev, newUser]);
      notification.showSuccess('Admin user created successfully');
      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      notification.showError('Failed to create admin user');
    }
  };

  const handleEditUser = async () => {
    if (!validateForm() || !selectedUser) return;

    try {
      const updatedUser: AdminUser = {
        ...selectedUser,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        isActive: formData.isActive,
        permissions: [...ADMIN_ROLES[formData.role].permissions],
      };

      setAdminUsers(prev => 
        prev.map(user => user.id === selectedUser.id ? updatedUser : user)
      );
      notification.showSuccess('Admin user updated successfully');
      resetForm();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      notification.showError('Failed to update admin user');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setAdminUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, isActive: !user.isActive } : user
        )
      );
      notification.showSuccess('User status updated');
    } catch (error) {
      notification.showError('Failed to update user status');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'INVENTORY_MANAGER',
      password: '',
      confirmPassword: '',
      isActive: true,
    });
    setFormErrors({});
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      password: '',
      confirmPassword: '',
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <LoadingScreen message="Loading admin users..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin User Management</Text>
          <Text style={styles.subtitle}>Manage administrator accounts and permissions</Text>
        </View>

        {/* Search and Filter */}
        <Card style={styles.filtersCard}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or email"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Button
              title="Add Admin"
              onPress={() => setShowCreateModal(true)}
              style={styles.addButton}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Role Filter:</Text>
            <View style={styles.roleFilters}>
              {(['ALL', ...Object.keys(ADMIN_ROLES)] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleFilter,
                    filterRole === role && styles.roleFilterActive
                  ]}
                  onPress={() => setFilterRole(role as AdminRole | 'ALL')}
                >
                  <Text style={[
                    styles.roleFilterText,
                    filterRole === role && styles.roleFilterTextActive
                  ]}>
                    {role === 'ALL' ? 'All Roles' : ADMIN_ROLES[role as AdminRole].name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Admin Users List */}
        <Card style={styles.usersCard}>
          <Text style={styles.sectionTitle}>Admin Users ({filteredUsers.length})</Text>
          
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={styles.userStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: user.isActive ? '#4CAF50' : '#f44336' }
                    ]} />
                    <Text style={styles.statusText}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userRole}>{ADMIN_ROLES[user.role].name}</Text>
                
                <View style={styles.userMeta}>
                  <Text style={styles.metaText}>
                    Last Login: {user.lastLogin?.toLocaleDateString() || 'Never'}
                  </Text>
                  <Text style={styles.metaText}>
                    Created: {user.createdAt.toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(user)}
                >
                  <Icon name="edit" size={20} color="#007AFF" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleToggleUserStatus(user.id)}
                >
                  <Icon 
                    name={user.isActive ? 'block' : 'check-circle'} 
                    size={20} 
                    color={user.isActive ? '#f44336' : '#4CAF50'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No admin users found</Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Create/Edit Admin User Modal */}
      <Modal
        visible={showCreateModal || showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showEditModal ? 'Edit Admin User' : 'Create Admin User'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <Input
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                error={formErrors.name}
                placeholder="Enter full name"
              />

              <Input
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                error={formErrors.email}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role</Text>
                <View style={styles.roleSelector}>
                  {(Object.keys(ADMIN_ROLES) as AdminRole[]).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        formData.role === role && styles.roleOptionSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, role }))}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        formData.role === role && styles.roleOptionTextSelected
                      ]}>
                        {ADMIN_ROLES[role].name}
                      </Text>
                      <Text style={styles.roleDescription}>
                        {ADMIN_ROLES[role].description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {!showEditModal && (
                <>
                  <Input
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                    error={formErrors.password}
                    placeholder="Enter password"
                    secureTextEntry
                  />

                  <Input
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                    error={formErrors.confirmPassword}
                    placeholder="Confirm password"
                    secureTextEntry
                  />
                </>
              )}

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active Status</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                  thumbColor={formData.isActive ? '#fff' : '#fff'}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={showEditModal ? 'Update' : 'Create'}
                onPress={showEditModal ? handleEditUser : handleCreateUser}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Notification notification={notification.notification} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
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
  },
  filtersCard: {
    marginBottom: 16,
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    paddingHorizontal: 20,
  },
  filterRow: {
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  roleFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleFilterActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleFilterText: {
    fontSize: 14,
    color: '#666',
  },
  roleFilterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  usersCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  roleSelector: {
    gap: 8,
  },
  roleOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  roleOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e7f3ff',
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  roleOptionTextSelected: {
    color: '#007AFF',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default AdminUserManagementScreen;