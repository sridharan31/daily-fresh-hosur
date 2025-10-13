// app/screens/admin/products/EditProductScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Button from '../../../components/common/Button';
import Header from '../../../components/common/Header';
import Input from '../../../components/common/Input';
import LoadingScreen from '../../../components/common/LoadingScreen';
import { AdminNavigationProp, AdminRouteProp } from '../../../navigation/navigationTypes';

const EditProductScreen: React.FC = () => {
  const navigation = useNavigation<AdminNavigationProp>();
  const route = useRoute<AdminRouteProp<'EditProduct'>>();
  const { productId } = route.params;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    unit: '',
    weight: '',
    stockQuantity: '',
    minStockLevel: '',
    brand: '',
    sku: '',
    tags: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      // Implementation for loading product data
      // Mock data for now
      setFormData({
        name: 'Sample Product',
        description: 'Sample description',
        price: '29.99',
        originalPrice: '39.99',
        category: 'Fruits',
        unit: 'kg',
        weight: '1kg',
        stockQuantity: '100',
        minStockLevel: '10',
        brand: 'Fresh Brand',
        sku: 'SP001',
        tags: 'fresh, organic',
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load product data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Implementation for updating product
      Alert.alert('Success', 'Product updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Implementation for deleting product
              Alert.alert('Success', 'Product deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading product..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title="Edit Product" 
        showBack 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Product Name *"
            placeholder="Enter product name"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />
          
          <Input
            label="Description"
            placeholder="Enter product description"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={4}
          />
          
          <Input
            label="Category *"
            placeholder="Select category"
            value={formData.category}
            onChangeText={(value) => handleInputChange('category', value)}
          />
          
          <Input
            label="Brand"
            placeholder="Enter brand name"
            value={formData.brand}
            onChangeText={(value) => handleInputChange('brand', value)}
          />
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <View style={styles.row}>
            <Input
              label="Price *"
              placeholder="0.00"
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              keyboardType="decimal-pad"
              containerStyle={styles.halfInput}
            />
            
            <Input
              label="Original Price"
              placeholder="0.00"
              value={formData.originalPrice}
              onChangeText={(value) => handleInputChange('originalPrice', value)}
              keyboardType="decimal-pad"
              containerStyle={styles.halfInput}
            />
          </View>
        </View>

        {/* Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          
          <View style={styles.row}>
            <Input
              label="Stock Quantity"
              placeholder="0"
              value={formData.stockQuantity}
              onChangeText={(value) => handleInputChange('stockQuantity', value)}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
            
            <Input
              label="Min Stock Level"
              placeholder="0"
              value={formData.minStockLevel}
              onChangeText={(value) => handleInputChange('minStockLevel', value)}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            onPress={handleSaveProduct}
            style={styles.saveButton}
            loading={saving}
          />
          
          <Button
            title="Delete Product"
            onPress={handleDeleteProduct}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
            variant="outline"
          />
          
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  saveButton: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  deleteButton: {
    borderColor: '#FF5722',
    marginBottom: 12,
    paddingVertical: 14,
  },
  deleteButtonText: {
    color: '#FF5722',
  },
  cancelButton: {
    borderColor: '#666',
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#666',
  },
});

export default EditProductScreen;
