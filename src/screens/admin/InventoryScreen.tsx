import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../lib/store';
import { fetchAdminProducts, updateProductStatus } from '../../../lib/store/slices/adminSlice';
import { ProductCategory } from '../../../lib/types/product';

interface InventoryItem {
  id: string;
  name: string;
  category: ProductCategory;
  stock: number;
  minStock: number;
  price: number;
  unit: string;
  lastRestocked: string;
  isActive: boolean;
  image?: string;
}

const InventoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, productsLoading } = useSelector((state: RootState) => state.admin);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateQuantity, setUpdateQuantity] = useState('');

  const categories: (string | ProductCategory)[] = ['all', 'fruits', 'vegetables', 'dairy', 'grains', 'beverages'];
  const filterTypes = [
    { key: 'all', label: 'All Items', color: '#666' },
    { key: 'low_stock', label: 'Low Stock', color: '#FF9800' },
    { key: 'out_of_stock', label: 'Out of Stock', color: '#F44336' },
    { key: 'active', label: 'Active', color: '#4CAF50' },
    { key: 'inactive', label: 'Inactive', color: '#9E9E9E' },
  ];

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = useCallback(() => {
    dispatch(fetchAdminProducts({}));
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
  }, [loadInventory]);

  // Transform admin products to inventory items
  const inventoryItems: InventoryItem[] = products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    stock: product.stock,
    minStock: 10, // Default minimum stock
    price: product.price,
    unit: product.unit,
    lastRestocked: product.lastRestocked || new Date().toISOString(),
    isActive: product.isActive,
    image: product.images?.[0],
  }));

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || String(item.category) === selectedCategory;
    
    let matchesFilter = true;
    switch (filterType) {
      case 'low_stock':
        matchesFilter = item.stock > 0 && item.stock <= item.minStock;
        break;
      case 'out_of_stock':
        matchesFilter = item.stock === 0;
        break;
      case 'active':
        matchesFilter = item.isActive;
        break;
      case 'inactive':
        matchesFilter = !item.isActive;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) return { status: 'Out of Stock', color: '#F44336' };
    if (item.stock <= item.minStock) return { status: 'Low Stock', color: '#FF9800' };
    return { status: 'In Stock', color: '#4CAF50' };
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedProduct(item);
    setUpdateQuantity(item.stock.toString());
    setShowUpdateModal(true);
  };

  const handleToggleStatus = (item: InventoryItem) => {
    Alert.alert(
      'Update Product Status',
      `${item.isActive ? 'Deactivate' : 'Activate'} ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => dispatch(updateProductStatus({ productId: item.id, isActive: !item.isActive })),
        },
      ]
    );
  };

  const handleStockUpdate = () => {
    if (!selectedProduct || !updateQuantity) return;
    
    const newStock = parseInt(updateQuantity);
    if (isNaN(newStock) || newStock < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // In a real app, you would dispatch an action to update stock
    Alert.alert('Success', `Stock updated to ${newStock} ${selectedProduct.unit}`);
    setShowUpdateModal(false);
    setSelectedProduct(null);
    setUpdateQuantity('');
  };

  const renderStockStats = () => {
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(item => item.stock > 0 && item.stock <= item.minStock).length;
    const outOfStockItems = inventoryItems.filter(item => item.stock === 0).length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.stock * item.price), 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{lowStockItems}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#F44336' }]}>{outOfStockItems}</Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{totalValue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>
    );
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
    const stockStatus = getStockStatus(item);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.itemImage} />
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{String(item.category)}</Text>
              <Text style={styles.itemPrice}>₹{item.price}/{item.unit}</Text>
            </View>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpdateStock(item)}
            >
              <Icon name="edit" size={20} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleStatus(item)}
            >
              <Icon
                name={item.isActive ? "visibility" : "visibility-off"}
                size={20}
                color={item.isActive ? "#4CAF50" : "#9E9E9E"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stockInfo}>
          <View style={styles.stockDetails}>
            <Text style={styles.stockQuantity}>
              Stock: {item.stock} {item.unit}
            </Text>
            <Text style={styles.minStock}>
              Min: {item.minStock} {item.unit}
            </Text>
          </View>
          <View style={[styles.stockStatus, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.stockStatusText}>{stockStatus.status}</Text>
          </View>
        </View>

        <Text style={styles.lastRestocked}>
          Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  const renderUpdateModal = () => (
    <Modal
      visible={showUpdateModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowUpdateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Stock</Text>
            <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {selectedProduct && (
            <View style={styles.modalContent}>
              <Text style={styles.productName}>{selectedProduct.name}</Text>
              <Text style={styles.currentStock}>
                Current Stock: {selectedProduct.stock} {selectedProduct.unit}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Quantity</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={updateQuantity}
                  onChangeText={setUpdateQuantity}
                  keyboardType="numeric"
                  placeholder="Enter quantity"
                />
                <Text style={styles.unitText}>{selectedProduct.unit}</Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowUpdateModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.updateButton]}
                  onPress={handleStockUpdate}
                >
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Icon name="file-download" size={20} color="#4CAF50" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {renderStockStats()}

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={String(category)}
            style={[
              styles.filterChip,
              selectedCategory === String(category) && styles.activeFilterChip,
            ]}
            onPress={() => setSelectedCategory(String(category))}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === String(category) && styles.activeFilterChipText,
              ]}
            >
              {String(category).charAt(0).toUpperCase() + String(category).slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Types */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFiltersContainer}>
        {filterTypes.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.typeFilterChip,
              filterType === filter.key && { backgroundColor: filter.color },
            ]}
            onPress={() => setFilterType(filter.key)}
          >
            <Text
              style={[
                styles.typeFilterChipText,
                filterType === filter.key && styles.activeTypeFilterChipText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inventory List */}
      {productsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderInventoryItem}
          keyExtractor={(item) => item.id}
          style={styles.itemsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="inventory" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No inventory items found</Text>
            </View>
          }
        />
      )}

      {/* Update Stock Modal */}
      {renderUpdateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  exportText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  typeFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  typeFilterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  typeFilterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTypeFilterChipText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockDetails: {
    flex: 1,
  },
  stockQuantity: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  minStock: {
    fontSize: 12,
    color: '#666',
  },
  stockStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  lastRestocked: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    minWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  currentStock: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 12,
    minWidth: 80,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    minWidth: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  updateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default InventoryScreen;

