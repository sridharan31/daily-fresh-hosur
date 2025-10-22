// app/screens/admin/products/EditProductScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from '../../../components/ui/WebCompatibleComponents';

import { supabase } from '../../../../lib/supabase';

interface FormData {
  name_en: string;
  name_ta: string;
  description_en: string;
  description_ta: string;
  category_en: string;
  category_ta: string;
  price: string;
  stock_quantity: string;
  unit: string;
  is_organic: boolean;
  is_featured: boolean;
  is_active: boolean;
}

const EditProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params as { productId: string };
  
  const [formData, setFormData] = useState<FormData>({
    name_en: '',
    name_ta: '',
    description_en: '',
    description_ta: '',
    category_en: '',
    category_ta: '',
    price: '',
    stock_quantity: '',
    unit: 'kg',
    is_organic: false,
    is_featured: false,
    is_active: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      if (product) {
        setFormData({
          name_en: product.name_en || '',
          name_ta: product.name_ta || '',
          description_en: product.description_en || '',
          description_ta: product.description_ta || '',
          category_en: product.category_en || '',
          category_ta: product.category_ta || '',
          price: product.price?.toString() || '',
          stock_quantity: product.stock_quantity?.toString() || '',
          unit: product.unit || 'kg',
          is_organic: product.is_organic || false,
          is_featured: product.is_featured || false,
          is_active: product.is_active !== false,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load product data');
      console.error('Load product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name_en || !formData.name_ta || !formData.price || !formData.category_en) {
      Alert.alert('Error', 'Please fill in all required fields (English name, Tamil name, price, and category)');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name_en: formData.name_en.trim(),
        name_ta: formData.name_ta.trim(),
        description_en: formData.description_en.trim(),
        description_ta: formData.description_ta.trim(),
        category_en: formData.category_en,
        category_ta: formData.category_ta,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        unit: formData.unit,
        is_organic: formData.is_organic,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      if (error) throw error;

      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update product');
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
            setSaving(true);
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

              if (error) throw error;

              Alert.alert('Success', 'Product deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete product');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Product</Text>
        <View style={{ width: 60 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Product Name (English) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter English name"
              value={formData.name_en}
              onChangeText={(value: string) => setFormData(prev => ({ ...prev, name_en: value }))}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Product Name (Tamil) *</Text>
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
          <Text style={styles.sectionTitle}>Category</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category (English) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Select or enter category"
              value={formData.category_en}
              onChangeText={(value: string) => setFormData(prev => ({ ...prev, category_en: value }))}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category (Tamil)</Text>
            <TextInput
              style={styles.input}
              placeholder="வகையை தேர்ந்தெடுக்கவும்"
              value={formData.category_ta}
              onChangeText={(value: string) => setFormData(prev => ({ ...prev, category_ta: value }))}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Stock</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.price}
                onChangeText={(value: string) => setFormData(prev => ({ ...prev, price: value }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputContainer, styles.flex1, styles.ml10]}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                placeholder="kg"
                value={formData.unit}
                onChangeText={(value: string) => setFormData(prev => ({ ...prev, unit: value }))}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.stock_quantity}
              onChangeText={(value: string) => setFormData(prev => ({ ...prev, stock_quantity: value }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Organic Product</Text>
            <Switch
              value={formData.is_organic}
              onValueChange={(value: boolean) => setFormData(prev => ({ ...prev, is_organic: value }))}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Featured Product</Text>
            <Switch
              value={formData.is_featured}
              onValueChange={(value: boolean) => setFormData(prev => ({ ...prev, is_featured: value }))}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Active Product</Text>
            <Switch
              value={formData.is_active}
              onValueChange={(value: boolean) => setFormData(prev => ({ ...prev, is_active: value }))}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabled]}
          onPress={handleSaveProduct}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Update Product'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.deleteButton, saving && styles.disabled]}
          onPress={handleDeleteProduct}
          disabled={saving}
        >
          <Text style={styles.deleteButtonText}>
            Delete Product
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  ml10: {
    marginLeft: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  switchLabel: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default EditProductScreen;