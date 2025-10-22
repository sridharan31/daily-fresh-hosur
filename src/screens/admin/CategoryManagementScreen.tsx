import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Category, productService } from '../../../lib/supabase/services/product';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from '../../components/ui/WebCompatibleComponents';

interface CategoryFormData {
  name_en: string;
  name_ta: string;
  description_en: string;
  description_ta: string;
  image_url: string;
  sort_order: string;
  is_active: boolean;
}

const CategoryManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showInactive, setShowInactive] = useState(false); // Hide inactive categories by default
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name_en: '',
    name_ta: '',
    description_en: '',
    description_ta: '',
    image_url: '',
    sort_order: '0',
    is_active: true
  });

  // Load data from Supabase
  const loadCategories = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await productService.getAllCategoriesForAdmin();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load categories: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Filter categories based on search and active status
  const applyFilters = useCallback(() => {
    let filtered = categories;
    
    // Filter by active/inactive status
    if (!showInactive) {
      filtered = filtered.filter(category => category.is_active);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(category => 
        category.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.name_ta.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredCategories(filtered);
  }, [categories, searchQuery, showInactive]);

  // Effects
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Event handlers
  const onRefresh = () => {
    setRefreshing(true);
    loadCategories(false);
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ta: '',
      description_en: '',
      description_ta: '',
      image_url: '',
      sort_order: '0',
      is_active: true
    });
  };

  const handleCreateCategory = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name_en: category.name_en,
      name_ta: category.name_ta,
      description_en: category.description_en || '',
      description_ta: category.description_ta || '',
      image_url: category.image_url || '',
      sort_order: category.sort_order?.toString() || '0',
      is_active: category.is_active
    });
    setShowEditModal(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name_en.trim() || !formData.name_ta.trim()) {
      Alert.alert('Error', 'Please fill in both English and Tamil names');
      return;
    }

    setActionLoading('save');
    try {
      const categoryData = {
        name_en: formData.name_en.trim(),
        name_ta: formData.name_ta.trim(),
        description_en: formData.description_en.trim(),
        description_ta: formData.description_ta.trim(),
        image_url: formData.image_url.trim(),
        sort_order: parseInt(formData.sort_order) || 0,
        ...(showEditModal && { is_active: formData.is_active })
      };

      if (showEditModal && selectedCategory) {
        await productService.updateCategory(selectedCategory.id, categoryData);
        Alert.alert('Success', 'Category updated successfully!');
      } else {
        await productService.createCategory(categoryData);
        Alert.alert('Success', 'Category created successfully!');
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      resetForm();
      loadCategories();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save category');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    Alert.alert(
      'Delete Category',
      `How would you like to delete "${category.name_en}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable Only',
          onPress: () => handleSoftDelete(category)
        },
        {
          text: 'Permanent Delete',
          style: 'destructive',
          onPress: () => handleHardDelete(category)
        }
      ]
    );
  };

  const handleSoftDelete = async (category: Category) => {
    setActionLoading(category.id);
    try {
      const result = await productService.deleteCategory(category.id);
      console.log('Soft delete result:', result);
      Alert.alert('Success', 'Category disabled successfully!');
      await loadCategories();
    } catch (error: any) {
      console.error('Soft delete error:', error);
      const msg = (error && error.message) ? error.message : String(error);
      
      if (msg.includes('active product')) {
        setActionLoading(null);
        Alert.alert(
          'Cannot disable',
          msg + '\n\nWould you like to force-disable this category anyway?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Force Disable',
              style: 'destructive',
              onPress: async () => {
                try {
                  setActionLoading(category.id);
                  await productService.forceDeleteCategory(category.id);
                  Alert.alert('Success', 'Category force-disabled.');
                  await loadCategories();
                } catch (forceErr: any) {
                  console.error('Force disable failed:', forceErr);
                  Alert.alert('Error', forceErr.message || 'Force disable failed');
                } finally {
                  setActionLoading(null);
                }
              }
            }
          ]
        );
        return;
      } else {
        Alert.alert('Error', msg || 'Failed to disable category');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleHardDelete = async (category: Category) => {
    Alert.alert(
      'Permanent Delete',
      `⚠️ WARNING: This will permanently remove "${category.name_en}" from the database.\n\nThis action cannot be undone! Are you absolutely sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE FOREVER',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(category.id);
            try {
              await productService.hardDeleteCategory(category.id);
              Alert.alert('Success', 'Category permanently deleted from database.');
              await loadCategories();
            } catch (error: any) {
              console.error('Hard delete error:', error);
              Alert.alert('Error', error.message || 'Failed to permanently delete category');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (category: Category) => {
    setActionLoading(category.id);
    try {
      await productService.updateCategory(category.id, { 
        is_active: !category.is_active 
      });
      loadCategories();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update category status');
    } finally {
      setActionLoading(null);
    }
  };

  // Render functions
  const getCategoryEmoji = (categoryName: string): string => {
    const emojiMap: { [key: string]: string } = {
      'Vegetables': '🥬',
      'காய்கறிகள்': '🥬',
      'Fruits': '🍎',
      'பழங்கள்': '🍎',
      'Dairy': '🥛',
      'பால் பொருட்கள்': '🥛',
      'Grocery': '🛒',
      'மளிகை': '🛒',
      'Spices': '🌶️',
      'மசாலா': '🌶️',
      'Organic': '🌱',
      'இயற்கை': '🌱',
      'Frozen': '❄️',
      'Bakery': '🍞'
    };
    return emojiMap[categoryName] || '🏷️';
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryEmoji}>
              {getCategoryEmoji(item.name_en)}
            </Text>
          </View>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{item.name_en}</Text>
            <Text style={styles.categoryNameTamil}>{item.name_ta}</Text>
            {item.description_en && (
              <Text style={styles.categoryDescription} numberOfLines={2}>
                {item.description_en}
              </Text>
            )}
            <View style={styles.categoryMeta}>
              <Text style={styles.categoryOrder}>Order: {item.sort_order}</Text>
              <View style={[
                styles.statusBadge,
                item.is_active ? styles.activeBadge : styles.inactiveBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  item.is_active ? styles.activeText : styles.inactiveText
                ]}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditCategory(item)}
          disabled={actionLoading === item.id}
        >
          <Text style={styles.actionButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, item.is_active ? styles.deactivateButton : styles.activateButton]}
          onPress={() => handleToggleStatus(item)}
          disabled={actionLoading === item.id}
        >
          <Text style={[styles.actionButtonText, !item.is_active && styles.activateButtonText]}>
            {actionLoading === item.id ? '⏳' : (item.is_active ? '⏸️ Disable' : '▶️ Enable')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCategory(item)}
          disabled={actionLoading === item.id}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFormModal = () => {
    const isCreate = showCreateModal;
    const title = isCreate ? 'Create Category' : 'Edit Category';
    const visible = showCreateModal || showEditModal;

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
            }}>
              <Text style={styles.cancelButton}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={handleSaveCategory}
              disabled={actionLoading === 'save'}
            >
              <Text style={[styles.saveButton, actionLoading === 'save' && styles.disabled]}>
                {actionLoading === 'save' ? '⏳' : '✓ Save'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Category Name (English) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter English name"
                  value={formData.name_en}
                  onChangeText={(value: string) => setFormData(prev => ({ ...prev, name_en: value }))}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Category Name (Tamil) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="தமிழ் பெயர்"
                  value={formData.name_ta}
                  onChangeText={(value: string) => setFormData(prev => ({ ...prev, name_ta: value }))}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description (English)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="English description"
                  value={formData.description_en}
                  onChangeText={(value: string) => setFormData(prev => ({ ...prev, description_en: value }))}
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description (Tamil)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="தமிழ் விளக்கம்"
                  value={formData.description_ta}
                  onChangeText={(value: string) => setFormData(prev => ({ ...prev, description_ta: value }))}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Settings</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChangeText={(value: string) => setFormData(prev => ({ ...prev, image_url: value }))}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sort Order</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={formData.sort_order}
                  onChangeText={(value: string) => setFormData(prev => ({ ...prev, sort_order: value }))}
                  keyboardType="numeric"
                />
              </View>
              
              {!isCreate && (
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Active Category</Text>
                  <Switch
                    value={formData.is_active}
                    onValueChange={(value: boolean) => setFormData(prev => ({ ...prev, is_active: value }))}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Category Management</Text>
            <Text style={styles.subtitle}>
              {filteredCategories.length} of {categories.length} categories
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateCategory}
          >
            <Text style={styles.addButtonText}>+ Add Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, showInactive && styles.filterButtonActive]}
            onPress={() => setShowInactive(!showInactive)}
          >
            <Text style={[styles.filterButtonText, showInactive && styles.filterButtonTextActive]}>
              {showInactive ? '👁️ Hide Deleted' : '👁️ Show Deleted'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories List */}
      <FlatList
        data={filteredCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item: Category) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff']}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Form Modal */}
      {renderFormModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  categoryNameTamil: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryOrder: {
    fontSize: 12,
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#d4edda',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#155724',
  },
  inactiveText: {
    color: '#721c24',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  activateButton: {
    backgroundColor: '#28a745',
  },
  deactivateButton: {
    backgroundColor: '#6c757d',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  activateButtonText: {
    color: '#fff',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6c757d',
  },
  saveButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  modalContent: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
});

export default CategoryManagementScreen;