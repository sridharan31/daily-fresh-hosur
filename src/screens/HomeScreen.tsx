import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Services
import productService from '../../lib/services/productService';
import cartService from '../../lib/services/cartService';
import localizationService from '../../lib/services/localizationService';
import { Product } from '../../lib/types/database';

// Types
interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    loadData();
    loadCartCount();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load featured products and categories in parallel
      const [products, categoriesData] = await Promise.all([
        productService.getFeaturedProducts(10),
        productService.getCategories()
      ]);

      setFeaturedProducts(products);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      const count = await cartService.getCartItemCount();
      setCartItemCount(count);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await cartService.addToCart(productId, 1);
      await loadCartCount();
      // Show success message
      console.log('Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Show error message
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 m-2 shadow-sm border border-gray-100"
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image
        source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }}
        className="w-full h-32 rounded-md mb-2"
        resizeMode="cover"
      />
      
      <Text className="text-lg font-semibold text-gray-800 mb-1">
        {localizationService.getLocalizedProductName(item)}
      </Text>
      
      <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
        {localizationService.getLocalizedProductDescription(item)}
      </Text>
      
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-green-600">
            {localizationService.formatCurrency(item.price)}
          </Text>
          {item.mrp && item.mrp > item.price && (
            <Text className="text-sm text-gray-500 line-through ml-2">
              {localizationService.formatCurrency(item.mrp)}
            </Text>
          )}
        </View>
        
        {item.discount_percentage > 0 && (
          <View className="bg-red-100 px-2 py-1 rounded">
            <Text className="text-xs text-red-600 font-medium">
              {item.discount_percentage}% {localizationService.t('discount')}
            </Text>
          </View>
        )}
      </View>
      
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-500">
          {localizationService.t('per_kg')}
        </Text>
        
        <TouchableOpacity
          className="bg-green-600 px-4 py-2 rounded-md"
          onPress={() => handleAddToCart(item.id)}
        >
          <Text className="text-white text-sm font-medium">
            {localizationService.t('add_to_cart')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {item.is_organic && (
        <View className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded">
          <Text className="text-xs text-white font-medium">
            {localizationService.t('organic')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 m-2 shadow-sm items-center border border-gray-100"
      onPress={() => navigation.navigate('CategoryProducts', { categoryId: item.id })}
    >
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/80' }}
        className="w-16 h-16 rounded-full mb-2"
        resizeMode="cover"
      />
      <Text className="text-sm font-medium text-gray-800 text-center">
        {localizationService.getLocalizedCategoryName(item)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
          <Text className="mt-4 text-gray-600">
            {localizationService.t('loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View>
          <Text className="text-2xl font-bold text-green-600">
            {localizationService.t('app_name')}
          </Text>
          <Text className="text-sm text-gray-600">
            {localizationService.t('hosur')}, {localizationService.t('tamil_nadu')}
          </Text>
        </View>
        
        <TouchableOpacity
          className="relative"
          onPress={() => navigation.navigate('Cart')}
        >
          <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center">
            <Text className="text-white text-lg">🛒</Text>
          </View>
          {cartItemCount > 0 && (
            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View>
            {/* Welcome Section */}
            <View className="bg-gradient-to-r from-green-500 to-green-600 p-4 m-4 rounded-lg">
              <Text className="text-white text-xl font-bold mb-2">
                {localizationService.t('welcome')} 👋
              </Text>
              <Text className="text-green-100">
                Fresh groceries delivered to your doorstep in Hosur
              </Text>
            </View>

            {/* Categories Section */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-800 mx-4 mb-3">
                {localizationService.t('category')}
              </Text>
              <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
              />
            </View>

            {/* Featured Products Section */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mx-4 mb-3">
                <Text className="text-lg font-bold text-gray-800">
                  Featured Products
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                  <Text className="text-green-600 font-medium">
                    {localizationService.t('view_all')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          <View className="mx-2">
            <FlatList
              data={featuredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;