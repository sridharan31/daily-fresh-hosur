import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../../../components/ui/WebCompatibleComponents';

import { z } from 'zod';
import { supabase } from '../../../../lib/supabase';
import { Category, productService } from '../../../../lib/supabase/services/product';
import Toast from '../../../components/common/Toast';

// Zod validation schema
const productSchema = z.object({
  name_en: z.string().min(1, 'English name is required').max(100, 'Name too long'),
  name_ta: z.string().min(1, 'Tamil name is required').max(100, 'Name too long'),
  description_en: z.string().max(500, 'Description too long').optional(),
  description_ta: z.string().max(500, 'Description too long').optional(),
  category_id: z.string().min(1, 'Category is required'),
  price: z.string().min(1, 'Price is required').refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Price must be a valid positive number'),
  stock_quantity: z.string().refine((val) => {
    const num = parseInt(val);
    return val === '' || (!isNaN(num) && num >= 0);
  }, 'Stock quantity must be a valid non-negative number'),
  unit: z.string().min(1, 'Unit is required'),
});

interface ProductData {
  name_en: string;
  name_ta: string;
  description_en: string;
  description_ta: string;
  category_id: string;
  price: string;
  stock_quantity: string;
  unit: string;
  is_organic: boolean;
  is_featured: boolean;
}



const UNITS = [
  { value: 'kg', label_en: 'Kilogram (kg)', label_ta: 'கலகரம (க.க)' },
  { value: 'g', label_en: 'Gram (g)', label_ta: 'கரம (க)' },
  { value: 'l', label_en: 'Liter (l)', label_ta: 'லடடர (ல)' },
  { value: 'ml', label_en: 'Milliliter (ml)', label_ta: 'மலலலடடர (ம.ல)' },
  { value: 'piece', label_en: 'Piece', label_ta: 'தணட' },
  { value: 'dozen', label_en: 'Dozen', label_ta: 'டஜன' },
  { value: 'packet', label_en: 'Packet', label_ta: 'பககட' },
  { value: 'bundle', label_en: 'Bundle', label_ta: 'கடட' },
];

const AddProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ta'>('en');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState<ProductData>({
    name_en: '',
    name_ta: '',
    description_en: '',
    description_ta: '',
    category_id: '',
    price: '',
    stock_quantity: '',
    unit: 'kg',
    is_organic: false,
    is_featured: false,
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    requestImagePermissions();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await productService.getCategories(); // Only get active categories
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoadingCategories(false);
    }
  };

  const requestImagePermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('We need camera roll permissions!', 'warning');
      }
    } catch (error) {
      console.log('Permission error:', error);
    }
  };

  const handleInputChange = (field: keyof ProductData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ta: '',
      description_en: '',
      description_ta: '',
      category_id: '',
      price: '',
      stock_quantity: '',
      unit: 'kg',
      is_organic: false,
      is_featured: false,
    });
    setImages([]);
    setErrors({});
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages(prev => [...prev, result.assets[0].uri]);
        showToast('Image added! 📸', 'success');
      }
    } catch (error) {
      showToast('Failed to pick image', 'error');
    }
  };

  const uploadImageToSupabase = async (imageUri: string): Promise<string | null> => {
    try {
      console.log('Uploading image to Supabase:', imageUri);
      
      // If it's already a valid HTTP URL, return as is
      if (imageUri.startsWith('http') && !imageUri.startsWith('blob:')) {
        return imageUri;
      }
      
      // Convert image URI to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `product_${timestamp}_${randomId}.jpg`;
      
      console.log('Uploading to bucket with filename:', fileName);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (error) {
        console.error('Supabase upload error:', error);
        // Fallback to placeholder if upload fails
        return 'https://via.placeholder.com/300x300.png?text=Upload+Failed';
      }
      
      console.log('Upload successful:', data);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
        
      console.log('Public URL generated:', publicUrl);
      return publicUrl;
      
    } catch (error) {
      console.error('Image upload failed:', error);
      // Fallback to placeholder on any error
      return 'https://via.placeholder.com/300x300.png?text=Upload+Error';
    }
  };

  const validateForm = (): boolean => {
    try {
      const validationData = {
        name_en: formData.name_en.trim(),
        name_ta: formData.name_ta.trim(),
        description_en: formData.description_en.trim(),
        description_ta: formData.description_ta.trim(),
        category_id: formData.category_id,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        unit: formData.unit,
      };

      productSchema.parse(validationData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        
        // Show first error in toast
        const firstError = error.errors[0];
        showToast(`Validation Error: ${firstError.message}`, 'error');
      }
      return false;
    }
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Get the selected category details from database
      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      
      if (!selectedCategory) {
        showToast('Please select a valid category', 'error');
        return;
      }
      
      // Upload images to Supabase Storage
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        console.log(`Starting upload of ${images.length} images`);
        
        for (let i = 0; i < images.length; i++) {
          const imageUri = images[i];
          console.log(`Uploading image ${i + 1}/${images.length}`);
          
          const uploadedUrl = await uploadImageToSupabase(imageUri);
          if (uploadedUrl) {
            uploadedImageUrls.push(uploadedUrl);
            console.log(`Successfully uploaded image ${i + 1}/${images.length}`);
          } else {
            console.error(`Failed to upload image ${i + 1}/${images.length}`);
          }
        }
        
        console.log(`Upload complete: ${uploadedImageUrls.length}/${images.length} images uploaded successfully`);
        
        if (uploadedImageUrls.length === 0) {
          showToast('Failed to upload any images. Product will be saved without images.', 'warning');
        } else if (uploadedImageUrls.length < images.length) {
          showToast(`${uploadedImageUrls.length}/${images.length} images uploaded successfully.`, 'info');
        }
      }
      
      // Map category names based on the selected category
      const getCategoryEnumValue = (categoryName: string) => {
        const mapping: Record<string, string> = {
          'Vegetables': 'vegetables',
          'Fruits': 'fruits', 
          'Dairy': 'dairy',
          'Grocery': 'grocery',
          'Spices': 'spices',
          'Organic': 'organic',
          'Frozen': 'frozen',
          'Bakery': 'bakery'
        };
        return mapping[categoryName] || 'grocery';
      };
      
      const productData = {
        name_en: formData.name_en.trim(),
        name_ta: formData.name_ta.trim(),
        description_en: formData.description_en.trim(),
        description_ta: formData.description_ta.trim(),
        category_id: formData.category_id,
        category_en: getCategoryEnumValue(selectedCategory.name_en),
        category_ta: selectedCategory.name_ta,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        unit: formData.unit,
        is_organic: formData.is_organic,
        is_featured: formData.is_featured,
        is_active: true,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
      };

      // Check for duplicate products before insertion
      const { data: existingProductsEn, error: checkErrorEn } = await supabase
        .from('products')
        .select('name_en')
        .eq('name_en', productData.name_en);

      const { data: existingProductsTa, error: checkErrorTa } = await supabase
        .from('products')
        .select('name_ta')
        .eq('name_ta', productData.name_ta);

      if (checkErrorEn || checkErrorTa) {
        console.error('Error checking for duplicates:', checkErrorEn || checkErrorTa);
      } else if ((existingProductsEn && existingProductsEn.length > 0) || (existingProductsTa && existingProductsTa.length > 0)) {
        const duplicateName = existingProductsEn && existingProductsEn.length > 0 ? productData.name_en : productData.name_ta;
        showToast(
          `Duplicate product: "${duplicateName}" already exists. Please use a different name.`,
          'warning'
        );
        return;
      }

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;

      // Show success toast
      showToast('Product added successfully! 🎉', 'success');
      
      // Reset form automatically after successful submission
      setTimeout(() => {
        resetForm();
      }, 1000); // Small delay to let user see the success message
    } catch (error: any) {
      showToast(error.message || 'Failed to add product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeContainer}>
      {/* Toast Component */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}> Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Product</Text>
        <TouchableOpacity onPress={() => setCurrentLanguage(currentLanguage === 'en' ? 'ta' : 'en')}>
          <Text style={styles.langButton}>{currentLanguage === 'en' ? 'தமழ' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}
          bounces={true}
          removeClippedSubviews={false}
        >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Product Name (English) *</Text>
            <TextInput
              style={[styles.input, errors.name_en && styles.inputError]}
              placeholder="Enter English name"
              value={formData.name_en}
              onChangeText={(value: string) => handleInputChange('name_en', value)}
            />
            {errors.name_en && <Text style={styles.errorText}>{errors.name_en}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Product Name (Tamil) *</Text>
            <TextInput
              style={[styles.input, errors.name_ta && styles.inputError]}
              placeholder="தமழ பயர"
              value={formData.name_ta}
              onChangeText={(value: string) => handleInputChange('name_ta', value)}
            />
            {errors.name_ta && <Text style={styles.errorText}>{errors.name_ta}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (English)</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description_en && styles.inputError]}
              placeholder="English description"
              value={formData.description_en}
              onChangeText={(value: string) => handleInputChange('description_en', value)}
              multiline
            />
            {errors.description_en && <Text style={styles.errorText}>{errors.description_en}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (Tamil)</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description_ta && styles.inputError]}
              placeholder="தமழ வளககம"
              value={formData.description_ta}
              onChangeText={(value: string) => handleInputChange('description_ta', value)}
              multiline
            />
            {errors.description_ta && <Text style={styles.errorText}>{errors.description_ta}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={[styles.categoryButton, errors.category_id && styles.inputError]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={[styles.categoryButtonText, !formData.category_id && styles.placeholder]}>
                {formData.category_id 
                  ? categories.find(c => c.id === formData.category_id)?.[currentLanguage === 'en' ? 'name_en' : 'name_ta']
                  : 'Select Category'
                }
              </Text>
            </TouchableOpacity>
            {errors.category_id && <Text style={styles.errorText}>{errors.category_id}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Stock</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder="0.00"
                value={formData.price}
                onChangeText={(value: string) => handleInputChange('price', value)}
                keyboardType="numeric"
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>
            
            <View style={[styles.inputContainer, styles.flex1, styles.ml10]}>
              <Text style={styles.label}>Unit *</Text>
              <TouchableOpacity
                style={[styles.categoryButton, errors.unit && styles.inputError]}
                onPress={() => setShowUnitPicker(true)}
              >
                <Text style={[styles.categoryButtonText, !formData.unit && styles.placeholder]}>
                  {formData.unit 
                    ? UNITS.find(u => u.value === formData.unit)?.[currentLanguage === 'en' ? 'label_en' : 'label_ta']
                    : 'Select Unit'
                  }
                </Text>
              </TouchableOpacity>
              {errors.unit && <Text style={styles.errorText}>{errors.unit}</Text>}
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Stock Quantity</Text>
            <TextInput
              style={[styles.input, errors.stock_quantity && styles.inputError]}
              placeholder="0"
              value={formData.stock_quantity}
              onChangeText={(value: string) => handleInputChange('stock_quantity', value)}
              keyboardType="numeric"
            />
            {errors.stock_quantity && <Text style={styles.errorText}>{errors.stock_quantity}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          
          <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
            <Text style={styles.addImageText}>+ Add Image</Text>
          </TouchableOpacity>
          
          {images.length > 0 && (
            <View style={styles.imageContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImages(prev => prev.filter((_, i) => i !== index))}
                  >
                    <Text style={styles.removeImageText}></Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Options</Text>
          
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleInputChange('is_organic', !formData.is_organic)}
          >
            <View style={[styles.checkbox, formData.is_organic && styles.checked]}>
              {formData.is_organic && <Text style={styles.checkmark}></Text>}
            </View>
            <Text style={styles.checkboxLabel}>Organic Product</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleInputChange('is_featured', !formData.is_featured)}
          >
            <View style={[styles.checkbox, formData.is_featured && styles.checked]}>
              {formData.is_featured && <Text style={styles.checkmark}></Text>}
            </View>
            <Text style={styles.checkboxLabel}>Featured Product</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabled]}
          onPress={handleSaveProduct}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Product'}
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

      {showCategoryPicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Category</Text>
            <ScrollView style={styles.pickerScrollView}>
              {categories.filter(cat => cat.is_active).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    handleInputChange('category_id', category.id);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>
                    {currentLanguage === 'en' ? category.name_en : category.name_ta}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.pickerCancel}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showUnitPicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Unit</Text>
            <ScrollView style={styles.pickerScrollView}>
              {UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={styles.pickerItem}
                  onPress={() => {
                    handleInputChange('unit', unit.value);
                    setShowUnitPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>
                    {currentLanguage === 'en' ? unit.label_en : unit.label_ta}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.pickerCancel}
              onPress={() => setShowUnitPicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 40, // Safe area top padding
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  langButton: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1e293b',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  ml10: {
    marginLeft: 12,
  },
  categoryButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholder: {
    color: '#9ca3af',
  },
  addImageButton: {
    borderWidth: 2,
    borderColor: '#0ea5e9',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  addImageText: {
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checked: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#0ea5e9',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  pickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: '70%',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e293b',
  },
  pickerScrollView: {
    maxHeight: 300,
  },
  pickerItem: {
    padding: 16,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  pickerCancel: {
    backgroundColor: '#ef4444',
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default AddProductScreen;
