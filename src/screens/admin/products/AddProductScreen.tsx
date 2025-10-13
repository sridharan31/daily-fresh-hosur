// app/screens/admin/products/AddProductScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Button from '../../../components/common/Button';
import Header from '../../../components/common/Header';
import Input from '../../../components/common/Input';
import { AdminNavigationProp } from '../../../navigation/navigationTypes';

const AddProductScreen: React.FC = () => {
  const navigation = useNavigation<AdminNavigationProp>();
  
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
  
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    // Implementation for image picker
    Alert.alert('Add Image', 'Image picker functionality');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Implementation for saving product
      Alert.alert('Success', 'Product added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Add New Product" showBack />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          
          <ScrollView
            horizontal
            style={styles.imageScrollView}
            contentContainerStyle={styles.imageContainer}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.productImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleAddImage}
            >
              <Text style={styles.addImageText}>+</Text>
              <Text style={styles.addImageLabel}>Add Image</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

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
          
          <Input
            label="Tags"
            placeholder="Enter tags (comma separated)"
            value={formData.tags}
            onChangeText={(value) => handleInputChange('tags', value)}
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

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          
          <View style={styles.row}>
            <Input
              label="Unit"
              placeholder="kg, pieces, liters"
              value={formData.unit}
              onChangeText={(value) => handleInputChange('unit', value)}
              containerStyle={styles.halfInput}
            />
            
            <Input
              label="Weight/Size"
              placeholder="1kg, 500g, etc."
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              containerStyle={styles.halfInput}
            />
          </View>
          
          <Input
            label="SKU"
            placeholder="Product SKU"
            value={formData.sku}
            onChangeText={(value) => handleInputChange('sku', value)}
          />
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
            title="Add Product"
            onPress={handleSaveProduct}
            style={styles.saveButton}
            loading={loading}
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
  imageScrollView: {
    marginBottom: 8,
  },
  imageContainer: {
    paddingRight: 16,
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  addImageText: {
    fontSize: 24,
    color: '#4CAF50',
    marginBottom: 4,
  },
  addImageLabel: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
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
  cancelButton: {
    borderColor: '#666',
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#666',
  },
});

export default AddProductScreen;
