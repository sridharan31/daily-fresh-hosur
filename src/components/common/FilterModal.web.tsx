import React, { useState } from 'react';

// Simple web fallback without HTML tags that could cause errors
const webSafeElement = (Component: string) => {
  if (typeof window !== 'undefined') {
    return Component;
  }
  return 'div'; // fallback
};

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
  const [filters, setFilters] = useState<FilterOptions>({
    category: [],
    priceRange: { min: 0, max: 10000 },
    organic: false,
    inStock: false,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [selectedPriceRange, setSelectedPriceRange] = useState<number>(-1);

  if (!visible) return null;

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const handlePriceRangeSelect = (index: number) => {
    const range = PRICE_RANGES[index];
    setSelectedPriceRange(index);
    setFilters(prev => ({
      ...prev,
      priceRange: { min: range.min, max: range.max }
    }));
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      category: [],
      priceRange: { min: 0, max: 10000 },
      organic: false,
      inStock: false,
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setSelectedPriceRange(-1);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{...styles.title, fontSize: '20px', fontWeight: 'bold', margin: 0}}>Filter Products</div>
          <button style={styles.closeButton} onClick={onClose}>
            <span style={styles.closeIcon}>×</span>
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Categories */}
          <div style={styles.section}>
            <div style={{...styles.sectionTitle, fontSize: '16px', fontWeight: 'bold', margin: '8px 0'}}>Categories</div>
            <div style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  style={{
                    ...styles.categoryChip,
                    ...(filters.category.includes(category) ? styles.categoryChipActive : {})
                  }}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={styles.section}>
            <div style={{...styles.sectionTitle, fontSize: '16px', fontWeight: 'bold', margin: '8px 0'}}>Price Range</div>
            <div style={styles.priceGrid}>
              {PRICE_RANGES.map((range, index) => (
                <button
                  key={index}
                  style={{
                    ...styles.priceOption,
                    ...(selectedPriceRange === index ? styles.priceOptionActive : {})
                  }}
                  onClick={() => handlePriceRangeSelect(index)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div style={styles.section}>
            <div style={{...styles.sectionTitle, fontSize: '16px', fontWeight: 'bold', margin: '8px 0'}}>Sort By</div>
            <div style={styles.sortGrid}>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  style={{
                    ...styles.sortOption,
                    ...(filters.sortBy === option.value ? styles.sortOptionActive : {})
                  }}
                  onClick={() => handleSortChange(option.value as FilterOptions['sortBy'])}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <div style={styles.section}>
            <div style={{...styles.sectionTitle, fontSize: '16px', fontWeight: 'bold', margin: '8px 0'}}>Additional Filters</div>
            <div style={styles.togglesContainer}>
              <label style={styles.toggleItem}>
                <input
                  type="checkbox"
                  checked={filters.organic}
                  onChange={(e) => setFilters(prev => ({ ...prev, organic: e.target.checked }))}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxLabel}>Organic Only</span>
              </label>
              <label style={styles.toggleItem}>
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxLabel}>In Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.resetButton} onClick={handleReset}>
            Reset All
          </button>
          <button style={styles.applyButton} onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  closeIcon: {
    fontSize: '24px',
    color: '#666',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px 24px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  categoryGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  categoryChip: {
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    color: '#ffffff',
  },
  priceGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  priceOption: {
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.2s',
  },
  priceOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    color: '#ffffff',
  },
  sortGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  sortOption: {
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sortOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    color: '#ffffff',
  },
  togglesContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  toggleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#4CAF50',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#333',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 24px 20px',
    borderTop: '1px solid #e0e0e0',
    gap: '12px',
  },
  resetButton: {
    flex: 1,
    background: 'none',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  applyButton: {
    flex: 1,
    background: '#4CAF50',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};