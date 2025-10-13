// src/components/review/ReviewFilters.tsx
import React, { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ReviewFilters as ReviewFiltersType } from '../../../lib/types/review';
import { useThemeContext } from '../../contexts/ThemeContext';
import StarRating from '../common/StarRating';

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFiltersChange: (filters: ReviewFiltersType) => void;
  totalReviews: number;
  ratingCounts?: { [key: number]: number };
  testID?: string;
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  filters,
  onFiltersChange,
  totalReviews,
  ratingCounts = {},
  testID = 'review-filters',
}) => {
  const { colors } = useThemeContext();
  const [showModal, setShowModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<ReviewFiltersType>(filters);

  const sortOptions = [
    { label: 'Most Recent', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Helpful', value: 'helpful' },
    { label: 'Highest Rating', value: 'rating_high' },
    { label: 'Lowest Rating', value: 'rating_low' },
  ];

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setShowModal(false);
  };

  const handleResetFilters = () => {
    const resetFilters: ReviewFiltersType = { sortBy: 'newest' };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    setShowModal(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.rating) count++;
    if (filters.verifiedOnly) count++;
    if (filters.withPhotos) count++;
    return count;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundSecondary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    scrollContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    filterChipTextActive: {
      color: colors.textInverse,
    },
    moreFiltersChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moreFiltersText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
      marginRight: 4,
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    badgeText: {
      color: colors.textInverse,
      fontSize: 12,
      fontWeight: 'bold',
    },
    modal: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    modalContent: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    ratingOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
      marginBottom: 8,
    },
    ratingOptionActive: {
      backgroundColor: colors.primary + '20',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    ratingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    ratingCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    sortOption: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
      marginBottom: 8,
    },
    sortOptionActive: {
      backgroundColor: colors.primary + '20',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    sortOptionText: {
      fontSize: 16,
      color: colors.text,
    },
    sortOptionTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    toggleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
      marginBottom: 8,
    },
    toggleText: {
      fontSize: 16,
      color: colors.text,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    resetButton: {
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    applyButton: {
      backgroundColor: colors.primary,
    },
    resetButtonText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    applyButtonText: {
      fontSize: 16,
      color: colors.textInverse,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        {/* Sort filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.sortBy && filters.sortBy !== 'newest' && styles.filterChipActive,
          ]}
          onPress={() => setShowModal(true)}
        >
          <Text
            style={[
              styles.filterChipText,
              filters.sortBy && filters.sortBy !== 'newest' && styles.filterChipTextActive,
            ]}
          >
            {sortOptions.find(option => option.value === filters.sortBy)?.label || 'Most Recent'}
          </Text>
          <Icon
            name="keyboard-arrow-down"
            size={18}
            color={filters.sortBy && filters.sortBy !== 'newest' ? colors.textInverse : colors.text}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        {/* Rating filter */}
        {filters.rating && (
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <StarRating rating={1} readonly size={12} maxRating={1} />
            <Text style={[styles.filterChipText, styles.filterChipTextActive]}>
              {filters.rating} Stars
            </Text>
          </TouchableOpacity>
        )}

        {/* Verified filter */}
        {filters.verifiedOnly && (
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <Icon name="verified" size={14} color={colors.textInverse} style={{ marginRight: 4 }} />
            <Text style={[styles.filterChipText, styles.filterChipTextActive]}>
              Verified Only
            </Text>
          </TouchableOpacity>
        )}

        {/* Photos filter */}
        {filters.withPhotos && (
          <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
            <Icon name="photo" size={14} color={colors.textInverse} style={{ marginRight: 4 }} />
            <Text style={[styles.filterChipText, styles.filterChipTextActive]}>
              With Photos
            </Text>
          </TouchableOpacity>
        )}

        {/* More filters button */}
        <TouchableOpacity style={styles.moreFiltersChip} onPress={() => setShowModal(true)}>
          <Text style={styles.moreFiltersText}>Filters</Text>
          <Icon name="tune" size={16} color={colors.text} />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Reviews</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Sort By Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    tempFilters.sortBy === option.value && styles.sortOptionActive,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, sortBy: option.value as any })}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      tempFilters.sortBy === option.value && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating Filter Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter by Rating</Text>
              <TouchableOpacity
                style={[styles.ratingOption, !tempFilters.rating && styles.ratingOptionActive]}
                onPress={() => setTempFilters({ ...tempFilters, rating: undefined })}
              >
                <Text style={styles.sortOptionText}>All Ratings</Text>
                <Text style={styles.ratingCount}>{totalReviews}</Text>
              </TouchableOpacity>

              {[5, 4, 3, 2, 1].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    tempFilters.rating === rating && styles.ratingOptionActive,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, rating })}
                >
                  <View style={styles.ratingLeft}>
                    <StarRating rating={rating} readonly size={16} />
                  </View>
                  <Text style={styles.ratingCount}>{ratingCounts[rating] || 0}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Other Filters Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Other Filters</Text>
              
              <TouchableOpacity
                style={styles.toggleOption}
                onPress={() => setTempFilters({ ...tempFilters, verifiedOnly: !tempFilters.verifiedOnly })}
              >
                <Text style={styles.toggleText}>Verified Purchases Only</Text>
                <Icon
                  name={tempFilters.verifiedOnly ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={tempFilters.verifiedOnly ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleOption}
                onPress={() => setTempFilters({ ...tempFilters, withPhotos: !tempFilters.withPhotos })}
              >
                <Text style={styles.toggleText}>Reviews with Photos</Text>
                <Icon
                  name={tempFilters.withPhotos ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={tempFilters.withPhotos ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.footerButton, styles.resetButton]} onPress={handleResetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.footerButton, styles.applyButton]} onPress={handleApplyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default ReviewFilters;