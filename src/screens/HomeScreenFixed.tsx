import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Services
import productService, { Product, Category } from '../../lib/services/productService';
import cartService from '../../lib/services/cartService';
import localizationService from '../../lib/services/localizationService';

interface HomeScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    loadData();
    loadCartCount();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load featured products
      const products = await productService.getFeaturedProducts(10);
      setFeaturedProducts(products);

      // Load categories
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const cartItems = await cartService.getCartItems();
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(totalItems);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await cartService.addToCart(productId, 1);
      loadCartCount(); // Refresh cart count
      // Show success message
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image 
        source={{ 
          uri: item.images[0] || 'https://via.placeholder.com/150x150?text=Product' 
        }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {localizationService.getCurrentLanguage() === 'ta' ? item.name_ta : item.name_en}
        </Text>
        <Text style={styles.productPrice}>
          {localizationService.formatCurrency(item.price)}
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => addToCart(item.id)}
          disabled={!item.is_active || item.stock_quantity === 0}
        >
          <Text style={styles.addButtonText}>
            {item.is_active && item.stock_quantity > 0 ? localizationService.t('addToCart') : localizationService.t('outOfStock')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigation.navigate('CategoryProducts', { categoryId: item.id })}
    >
      <Image 
        source={{ 
          uri: item.image_url || 'https://via.placeholder.com/80x80?text=Category' 
        }}
        style={styles.categoryIcon}
      />
      <Text style={styles.categoryName} numberOfLines={2}>
        {localizationService.getCurrentLanguage() === 'ta' ? item.name_ta : item.name_en}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>
            {localizationService.t('loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.appName}>
              {localizationService.t('appName')}
            </Text>
            <Text style={styles.subtitle}>
              {localizationService.t('freshDelivery')}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/263/263142.png' }}
              style={styles.cartIcon}
            />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {localizationService.t('categories')}
              </Text>
              <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </View>

            {/* Featured Products Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {localizationService.t('featuredProducts')}
              </Text>
            </View>
          </View>
        }
        data={featuredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cartButton: {
    position: 'relative',
    backgroundColor: '#ecfdf5',
    padding: 8,
    borderRadius: 20,
  },
  cartIcon: {
    width: 24,
    height: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
  },
  categoryName: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#374151',
  },
  productsList: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 8,
    width: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeScreen;