import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../src/hooks/useTheme';

// Mock offers data
interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  category: string;
  image: string;
  isActive: boolean;
}

const OFFERS: Offer[] = [
  {
    id: 'offer1',
    title: 'Fresh Fruits Festival',
    description: 'Get 25% off on all fresh fruits. Premium quality guaranteed!',
    discount: '25% OFF',
    validUntil: '2025-10-31',
    category: 'Fresh Fruits',
    image: 'https://via.placeholder.com/300x150/4CAF50/FFFFFF?text=Fresh+Fruits+25%25+OFF',
    isActive: true,
  },
  {
    id: 'offer2',
    title: 'Organic Vegetables Bonanza',
    description: 'Buy 2 get 1 free on premium organic vegetables',
    discount: 'Buy 2 Get 1',
    validUntil: '2025-10-25',
    category: 'Organic Vegetables',
    image: 'https://via.placeholder.com/300x150/FF9800/FFFFFF?text=Organic+Veggies+B2G1',
    isActive: true,
  },
  {
    id: 'offer3',
    title: 'Free Express Delivery',
    description: 'Free same-day delivery on orders above AED 75',
    discount: 'FREE DELIVERY',
    validUntil: '2025-12-31',
    category: 'Delivery',
    image: 'https://via.placeholder.com/300x150/2196F3/FFFFFF?text=Free+Express+Delivery',
    isActive: true,
  },
  {
    id: 'offer4',
    title: 'Weekend Family Pack',
    description: '20% off on your entire cart every weekend',
    discount: '20% OFF',
    validUntil: '2025-12-15',
    category: 'Weekend',
    image: 'https://via.placeholder.com/300x150/9C27B0/FFFFFF?text=Weekend+Family+20%25',
    isActive: true,
  },
  {
    id: 'offer5',
    title: 'New Customer Special',
    description: 'First-time buyers get 30% off + free delivery',
    discount: '30% OFF + FREE',
    validUntil: '2025-11-30',
    category: 'New Customer',
    image: 'https://via.placeholder.com/300x150/FF5722/FFFFFF?text=New+Customer+30%25',
    isActive: true,
  },
  {
    id: 'offer6',
    title: 'Dairy Products Deal',
    description: 'Buy 3 dairy products and save 15% on total',
    discount: '15% OFF',
    validUntil: '2025-10-20',
    category: 'Dairy',
    image: 'https://via.placeholder.com/300x150/795548/FFFFFF?text=Dairy+Deal+15%25',
    isActive: true,
  },
  {
    id: 'offer7',
    title: 'Bulk Order Savings',
    description: 'Orders above AED 200 get extra 10% discount',
    discount: '10% EXTRA',
    validUntil: '2025-11-15',
    category: 'Bulk Order',
    image: 'https://via.placeholder.com/300x150/607D8B/FFFFFF?text=Bulk+Order+10%25',
    isActive: true,
  },
  {
    id: 'offer8',
    title: 'Loyalty Rewards',
    description: 'Earn 2x points on every purchase this month',
    discount: '2X POINTS',
    validUntil: '2025-10-31',
    category: 'Loyalty',
    image: 'https://via.placeholder.com/300x150/E91E63/FFFFFF?text=2X+Loyalty+Points',
    isActive: true,
  }
];

export default function OffersScreen() {
  const [offers] = useState<Offer[]>(OFFERS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const categories = ['All', ...Array.from(new Set(OFFERS.map(offer => offer.category)))];

  const filteredOffers = selectedCategory === 'All' 
    ? offers 
    : offers.filter(offer => offer.category === selectedCategory);

  const handleOfferPress = (offer: Offer) => {
    // Navigate to category or show offer details
    switch (offer.category) {
      case 'Fresh Fruits':
        router.push({
          pathname: '/category/[id]' as any,
          params: { id: '2', name: 'Fresh Fruits' }
        });
        break;
      case 'Organic Vegetables':
        router.push({
          pathname: '/category/[id]' as any,
          params: { id: '3', name: 'Organic Vegetables' }
        });
        break;
      case 'Dairy':
        router.push({
          pathname: '/category/[id]' as any,
          params: { id: '4', name: 'Dairy Products' }
        });
        break;
      case 'Delivery':
      case 'Weekend':
      case 'New Customer':
      case 'Bulk Order':
      case 'Loyalty':
        // Show offer details or go to home
        Alert.alert(
          offer.title,
          `${offer.description}\n\nValid until: ${new Date(offer.validUntil).toLocaleDateString()}\n\nStart shopping to claim this offer!`,
          [
            { text: 'Shop Now', onPress: () => router.push('/(tabs)/home') },
            { text: 'OK' }
          ]
        );
        break;
      default:
        router.push('/(tabs)/home');
    }
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => handleOfferPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.offerImage} />
      <View style={styles.offerContent}>
        <View style={styles.offerHeader}>
          <Text style={styles.offerTitle}>{item.title}</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        </View>
        <Text style={styles.offerDescription}>{item.description}</Text>
        <View style={styles.offerFooter}>
          <Text style={styles.categoryText}>{item.category}</Text>
          <Text style={styles.validUntilText}>
            Valid until {new Date(item.validUntil).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Special Offers</Text>
        
        <View style={styles.headerRight} />
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilter}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.selectedCategoryButtonText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Offers List */}
      <FlatList
        data={filteredOffers}
        renderItem={renderOffer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.offersList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.headerInfo}>
            <Icon name="local-offer" size={24} color="#4CAF50" />
            <Text style={styles.headerInfoText}>
              {selectedCategory === 'All' 
                ? 'Exclusive deals and discounts just for you!' 
                : `${filteredOffers.length} ${selectedCategory} offers available`}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="local-offer" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No offers available in this category</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setSelectedCategory('All')}
            >
              <Text style={styles.emptyButtonText}>View All Offers</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBackground,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  headerInfoText: {
    flex: 1,
    fontSize: 14,
    color: colors.successDark,
    fontWeight: '500',
  },
  offersList: {
    paddingBottom: 20,
  },
  offerCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  offerImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  offerContent: {
    padding: 16,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  offerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  offerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: colors.primaryBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  validUntilText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  filterContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});