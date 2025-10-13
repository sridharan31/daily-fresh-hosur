import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  category: string[];
  priceRange: {
    min: number;
    max: number;
  };
  organic: boolean;
  inStock: boolean;
  sortBy: 'name' | 'price' | 'rating' | 'newest';
  sortOrder: 'asc' | 'desc';
}

const CATEGORIES = [
  'Fresh Vegetables',
  'Fresh Fruits', 
  'Organic Vegetables',
  'Organic Fruits',
  'Rice & Grains',
  'Special Offers'
];

const PRICE_RANGES = [
  { label: 'Under ₹50', min: 0, max: 50 },
  { label: '₹50 - ₹100', min: 50, max: 100 },
  { label: '₹100 - ₹200', min: 100, max: 200 },
  { label: '₹200 - ₹500', min: 200, max: 500 },
  { label: 'Above ₹500', min: 500, max: 10000 },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{min: number; max: number}>({ min: 0, max: 10000 });
  const [organicOnly, setOrganicOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'newest'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      category: selectedCategories,
      priceRange: selectedPriceRange,
      organic: organicOnly,
      inStock: inStockOnly,
      sortBy,
      sortOrder,
    });
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange({ min: 0, max: 10000 });
    setOrganicOnly(false);
    setInStockOnly(true);
    setSortBy('name');
    setSortOrder('asc');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter & Sort</Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.filterItem}
                onPress={() => toggleCategory(category)}
              >
                <Text style={styles.filterText}>{category}</Text>
                <View style={[
                  styles.checkbox,
                  selectedCategories.includes(category) && styles.checkboxSelected
                ]}>
                  {selectedCategories.includes(category) && (
                    <Icon name="check" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            {PRICE_RANGES.map((range) => (
              <TouchableOpacity
                key={range.label}
                style={styles.filterItem}
                onPress={() => setSelectedPriceRange({ min: range.min, max: range.max })}
              >
                <Text style={styles.filterText}>{range.label}</Text>
                <View style={[
                  styles.radio,
                  selectedPriceRange.min === range.min && selectedPriceRange.max === range.max && styles.radioSelected
                ]}>
                  {selectedPriceRange.min === range.min && selectedPriceRange.max === range.max && (
                    <View style={styles.radioDot} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Special Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Filters</Text>
            
            <TouchableOpacity
              style={styles.filterItem}
              onPress={() => setOrganicOnly(!organicOnly)}
            >
              <Text style={styles.filterText}>Organic Only</Text>
              <View style={[styles.checkbox, organicOnly && styles.checkboxSelected]}>
                {organicOnly && <Icon name="check" size={16} color="#fff" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterItem}
              onPress={() => setInStockOnly(!inStockOnly)}
            >
              <Text style={styles.filterText}>In Stock Only</Text>
              <View style={[styles.checkbox, inStockOnly && styles.checkboxSelected]}>
                {inStockOnly && <Icon name="check" size={16} color="#fff" />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.filterItem}
                onPress={() => setSortBy(option.value as any)}
              >
                <Text style={styles.filterText}>{option.label}</Text>
                <View style={[styles.radio, sortBy === option.value && styles.radioSelected]}>
                  {sortBy === option.value && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Sort Order */}
            <View style={styles.sortOrderContainer}>
              <TouchableOpacity
                style={[styles.sortOrderButton, sortOrder === 'asc' && styles.sortOrderSelected]}
                onPress={() => setSortOrder('asc')}
              >
                <Icon name="arrow-upward" size={16} color={sortOrder === 'asc' ? '#fff' : '#666'} />
                <Text style={[styles.sortOrderText, sortOrder === 'asc' && styles.sortOrderTextSelected]}>
                  Ascending
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sortOrderButton, sortOrder === 'desc' && styles.sortOrderSelected]}
                onPress={() => setSortOrder('desc')}
              >
                <Icon name="arrow-downward" size={16} color={sortOrder === 'desc' ? '#fff' : '#666'} />
                <Text style={[styles.sortOrderText, sortOrder === 'desc' && styles.sortOrderTextSelected]}>
                  Descending
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  filterText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#4CAF50',
  },
  radioDot: {
    width: 10,
    height: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  sortOrderContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  sortOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    gap: 4,
  },
  sortOrderSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortOrderText: {
    fontSize: 14,
    color: '#666',
  },
  sortOrderTextSelected: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Default export for Expo Router compatibility
export default FilterModal;