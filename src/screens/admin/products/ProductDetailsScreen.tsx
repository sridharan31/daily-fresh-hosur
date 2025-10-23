// app/screens/admin/products/ProductDetailsScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from '../../../components/ui/WebCompatibleComponents';

import { supabase } from '../../../../lib/supabase';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingScreen from '../../../components/common/LoadingScreen';
import { AdminNavigationProp, AdminRouteProp } from '../../../navigation/navigationTypes';

interface ProductDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  unit: string;
  weight: string;
  stockQuantity: number;
  minStockLevel: number;
  sku: string;
  tags: string[];
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
  salesCount: number;
  rating: number;
  reviewCount: number;
}

const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AdminNavigationProp>();
  const route = useRoute<AdminRouteProp<'ProductDetails'>>();
  const { productId } = route.params;
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (productData) {
        const productDetails: ProductDetails = {
          id: productData.id,
          name: productData.name_en,
          description: productData.description_en || '',
          price: productData.price,
          originalPrice: productData.mrp,
          category: productData.category_en,
          brand: 'Daily Fresh Hosur',
          unit: productData.unit,
          weight: productData.weight?.toString() || '',
          stockQuantity: productData.stock_quantity,
          minStockLevel: 10, // Default value
          sku: productData.id.slice(0, 8).toUpperCase(),
          tags: productData.tags || [],
          images: productData.images || ['https://via.placeholder.com/300x300/4CAF50/white?text=Product'],
          status: productData.is_active ? 'active' : 'inactive',
          createdAt: productData.created_at,
          updatedAt: productData.updated_at,
          salesCount: productData.sold_count || 0,
          rating: productData.rating || 0,
          reviewCount: productData.review_count || 0,
        };
        
        setProduct(productDetails);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = () => {
    navigation.navigate('EditProduct', { productId });
  };

  const handleToggleStatus = () => {
    if (!product) return;
    
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    Alert.alert(
      `${newStatus === 'active' ? 'Activate' : 'Deactivate'} Product`,
      `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this product?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'active' ? 'Activate' : 'Deactivate',
          onPress: () => {
            setProduct(prev => prev ? { ...prev, status: newStatus } : null);
            Alert.alert('Success', `Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading product details..." />;
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FF9800';
      case 'out_of_stock': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'out_of_stock': return 'Out of Stock';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* <Header 
        title="Product Details" 
        showBack 
      /> */}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Images */}
        <ScrollView
          horizontal
          style={styles.imageScrollView}
          contentContainerStyle={styles.imageContainer}
          showsHorizontalScrollIndicator={false}
        >
          {product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.productImage}
            />
          ))}
        </ScrollView>

        {/* Basic Information */}
        <Card style={styles.section}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleSection}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(product.status) }]}>
                <Text style={styles.statusText}>{getStatusText(product.status)}</Text>
              </View>
            </View>
            
            <View style={styles.priceSection}>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
              )}
            </View>
          </View>

          <Text style={styles.description}>{product.description}</Text>
          
          <View style={styles.tagsContainer}>
            {product.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Product Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{product.category}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Brand:</Text>
            <Text style={styles.detailValue}>{product.brand}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Unit:</Text>
            <Text style={styles.detailValue}>{product.unit}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight/Size:</Text>
            <Text style={styles.detailValue}>{product.weight}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>SKU:</Text>
            <Text style={styles.detailValue}>{product.sku}</Text>
          </View>
        </Card>

        {/* Inventory */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          
          <View style={styles.inventoryGrid}>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryNumber}>{product.stockQuantity}</Text>
              <Text style={styles.inventoryLabel}>Current Stock</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryNumber}>{product.minStockLevel}</Text>
              <Text style={styles.inventoryLabel}>Min Level</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryNumber}>{product.salesCount}</Text>
              <Text style={styles.inventoryLabel}>Total Sales</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryNumber}>{product.rating.toFixed(1)} ⭐</Text>
              <Text style={styles.inventoryLabel}>{product.reviewCount} reviews</Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Edit Product"
            onPress={handleEditProduct}
            style={styles.editButton}
          />
          
          <Button
            title={product.status === 'active' ? 'Deactivate' : 'Activate'}
            onPress={handleToggleStatus}
            style={{
              ...styles.statusButton,
              backgroundColor: product.status === 'active' ? '#FF9800' : '#4CAF50'
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  imageScrollView: {
    marginBottom: 16,
  },
  imageContainer: {
    paddingHorizontal: 16,
  },
  productImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 20,
  },
  productHeader: {
    marginBottom: 16,
  },
  productTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inventoryItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  inventoryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  inventoryLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  editButton: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  statusButton: {
    paddingVertical: 14,
  },
});

export default ProductDetailsScreen;
