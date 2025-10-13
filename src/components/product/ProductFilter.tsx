 // app/components/product/ProductFilter.tsx
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ProductCategory, ProductFilter } from '../../../lib/types/product';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface ProductFilterProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ProductFilter) => void;
  initialFilters?: ProductFilter;
  categories: ProductCategory[];
  priceRange: {min: number; max: number};
  style?: ViewStyle;
  testID?: string;
}

const ProductFilterComponent: React.FC<ProductFilterProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  categories,
  priceRange,
  style,
  testID,
}) => {
  const [filters, setFilters] = useState<ProductFilter>(initialFilters);
  const [selectedPriceRange, setSelectedPriceRange] = useState({
    min: initialFilters.priceRange?.min || priceRange.min,
    max: initialFilters.priceRange?.max || priceRange.max,
  });

  useEffect(() => {
    setFilters(initialFilters);
    setSelectedPriceRange({
      min: initialFilters.priceRange?.min || priceRange.min,
      max: initialFilters.priceRange?.max || priceRange.max,
    });
  }, [initialFilters, priceRange]);

  const handleCategorySelect = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === categoryId ? undefined : categoryId,
    }));
  };

  const handleSubCategorySelect = (subCategory: string) => {
    setFilters(prev => ({
      ...prev,
      subCategory: prev.subCategory === subCategory ? undefined : subCategory,
    }));
  };

  const handleOrganicToggle = () => {
    setFilters(prev => ({
      ...prev,
      isOrganic: prev.isOrganic === undefined ? true : !prev.isOrganic,
    }));
  };

  const handleInStockToggle = () => {
    setFilters(prev => ({
      ...prev,
      inStock: prev.inStock === undefined ? true : !prev.inStock,
    }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder,
    }));
  };

  const handlePriceRangeChange = (value: number, type: 'min' | 'max') => {
    setSelectedPriceRange(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleApply = () => {
    const finalFilters: ProductFilter = {
      ...filters,
      priceRange: selectedPriceRange,
    };
    onApply(finalFilters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    setSelectedPriceRange({
      min: priceRange.min,
      max: priceRange.max,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.subCategory) count++;
    if (filters.isOrganic !== undefined) count++;
    if (filters.inStock !== undefined) count++;
    if (filters.sortBy) count++;
    if (selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max) count++;
    return count;
  };

  const formatPrice = (price: number) => {
    return `₹${price}`;
  };

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.optionsList}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.optionItem,
              filters.category === category.id && styles.selectedOption,
            ]}
            onPress={() => handleCategorySelect(category.id)}
            testID={`${testID}-category-${category.id}`}
          >
            <Text
              style={[
                styles.optionText,
                filters.category === category.id && styles.selectedOptionText,
              ]}
            >
              {category.name}
            </Text>
            {filters.category === category.id && (
              <Icon name="check" size={16} color="#4CAF50" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPriceRange = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Price Range</Text>
      <View style={styles.priceRangeContainer}>
        <View style={styles.priceLabels}>
          <Text style={styles.priceLabel}>
            {formatPrice(selectedPriceRange.min)}
          </Text>
          <Text style={styles.priceLabel}>
            {formatPrice(selectedPriceRange.max)}
          </Text>
        </View>
        
        <View style={styles.slidersContainer}>
          <Text style={styles.sliderLabel}>Min Price</Text>
          <Slider
            style={styles.slider}
            minimumValue={priceRange.min}
            maximumValue={selectedPriceRange.max - 1}
            value={selectedPriceRange.min}
            onValueChange={(value) => handlePriceRangeChange(Math.round(value), 'min')}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#e0e0e0"
            thumbStyle={styles.sliderThumb}
          />
          
          <Text style={styles.sliderLabel}>Max Price</Text>
          <Slider
            style={styles.slider}
            minimumValue={selectedPriceRange.min + 1}
            maximumValue={priceRange.max}
            value={selectedPriceRange.max}
            onValueChange={(value) => handlePriceRangeChange(Math.round(value), 'max')}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#e0e0e0"
            thumbStyle={styles.sliderThumb}
          />
        </View>
      </View>
    </View>
  );

  const renderToggleOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Product Options</Text>
      
      <TouchableOpacity
        style={styles.toggleOption}
        onPress={handleOrganicToggle}
        testID={`${testID}-organic-toggle`}
      >
        <Text style={styles.toggleText}>Organic Products Only</Text>
        <View style={[
          styles.toggleSwitch,
          filters.isOrganic && styles.toggleSwitchActive,
        ]}>
          <View style={[
            styles.toggleThumb,
            filters.isOrganic && styles.toggleThumbActive,
          ]} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toggleOption}
        onPress={handleInStockToggle}
        testID={`${testID}-stock-toggle`}
      >
        <Text style={styles.toggleText}>In Stock Only</Text>
        <View style={[
          styles.toggleSwitch,
          filters.inStock && styles.toggleSwitchActive,
        ]}>
          <View style={[
            styles.toggleThumb,
            filters.inStock && styles.toggleThumbActive,
          ]} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderSortOptions = () => {
    const sortOptions = [
      {key: 'name-asc', label: 'Name A-Z', sortBy: 'name', sortOrder: 'asc'},
      {key: 'name-desc', label: 'Name Z-A', sortBy: 'name', sortOrder: 'desc'},
      {key: 'price-asc', label: 'Price Low to High', sortBy: 'price', sortOrder: 'asc'},
      {key: 'price-desc', label: 'Price High to Low', sortBy: 'price', sortOrder: 'desc'},
      {key: 'rating-desc', label: 'Highest Rated', sortBy: 'rating', sortOrder: 'desc'},
      {key: 'newest', label: 'Newest First', sortBy: 'newest', sortOrder: 'desc'},
    ] as const;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        <View style={styles.optionsList}>
          {sortOptions.map((option) => {
            const isSelected = filters.sortBy === option.sortBy && filters.sortOrder === option.sortOrder;
            
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionItem,
                  isSelected && styles.selectedOption,
                ]}
                onPress={() => handleSortChange(option.sortBy, option.sortOrder)}
                testID={`${testID}-sort-${option.key}`}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
                {isSelected && (
                  <Icon name="check" size={16} color="#4CAF50" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Filters ${getActiveFiltersCount() > 0 ? `(${getActiveFiltersCount()})` : ''}`}
      variant="bottom"
      style={style}
      testID={testID}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCategories()}
        {renderPriceRange()}
        {renderToggleOptions()}
        {renderSortOptions()}
      </ScrollView>

      <View style={styles.actions}>
        <Button
          title="Clear All"
          variant="outline"
          onPress={handleClear}
          style={styles.actionButton}
          testID={`${testID}-clear`}
        />
        <Button
          title={`Apply Filters${getActiveFiltersCount() > 0 ? ` (${getActiveFiltersCount()})` : ''}`}
          onPress={handleApply}
          style={styles.actionButton}
          testID={`${testID}-apply`}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  priceRangeContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  slidersContainer: {
    gap: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  slider: {
    height: 40,
    marginBottom: 8,
  },
  sliderThumb: {
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#333',
  },
  toggleSwitch: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});

export default ProductFilterComponent;
