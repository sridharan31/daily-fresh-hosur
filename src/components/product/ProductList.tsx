 // app/components/product/ProductList.tsx
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product, ProductFilter } from '../../../lib/types/product';
import Loader from '../common/Loader';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  favoriteProductIds?: string[];
  onProductPress?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onToggleFavorite?: (product: Product) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  filters?: ProductFilter;
  style?: ViewStyle;
  testID?: string;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading = false,
  error = null,
  hasMore = false,
  favoriteProductIds = [],
  onProductPress,
  onAddToCart,
  onToggleFavorite,
  onLoadMore,
  onRefresh,
  onViewModeChange,
  filters,
  style,
  testID,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  }, [onRefresh]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  const renderProduct = ({item}: {item: Product}) => (
    <ProductCard
      product={item}
      variant={viewMode}
      isFavorite={favoriteProductIds.includes(item.id)}
      onPress={onProductPress}
      onAddToCart={onAddToCart}
      onToggleFavorite={onToggleFavorite}
      testID={`${testID}-product-${item.id}`}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsCount}>
          {products.length} products found
        </Text>
        {filters?.category && (
          <Text style={styles.categoryFilter}>
            in {filters.category}
          </Text>
        )}
      </View>

      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'grid' && styles.activeViewMode,
          ]}
          onPress={() => handleViewModeChange('grid')}
          testID={`${testID}-grid-view`}
        >
          <Icon 
            name="grid-view" 
            size={20} 
            color={viewMode === 'grid' ? '#4CAF50' : '#666'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'list' && styles.activeViewMode,
          ]}
          onPress={() => handleViewModeChange('list')}
          testID={`${testID}-list-view`}
        >
          <Icon 
            name="view-list" 
            size={20} 
            color={viewMode === 'list' ? '#4CAF50' : '#666'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footer}>
        <Loader size="small" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading more products...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="shopping-basket" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptyMessage}>
        Try adjusting your filters or search terms
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Icon name="error-outline" size={64} color="#F44336" />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      {onRefresh && (
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (error && products.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={[
          styles.listContainer,
          products.length === 0 && styles.emptyListContainer,
        ]}
        columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
        ListHeaderComponent={products.length > 0 ? renderHeader : undefined}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={loading ? null : renderEmptyState}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        showsVerticalScrollIndicator={false}
        testID={`${testID}-list`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  resultsInfo: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryFilter: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeViewMode: {
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductList;

