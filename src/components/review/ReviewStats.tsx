// src/components/review/ReviewStats.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReviewStats as ReviewStatsType } from '../../../lib/types/review';
import { useThemeContext } from '../../contexts/ThemeContext';
import StarRating from '../common/StarRating';

interface ReviewStatsProps {
  stats: ReviewStatsType;
  testID?: string;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ 
  stats, 
  testID = 'review-stats' 
}) => {
  const { colors } = useThemeContext();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    averageRating: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginRight: 12,
    },
    ratingInfo: {
      flex: 1,
    },
    totalReviews: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    distributionContainer: {
      marginBottom: 16,
    },
    distributionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    starLabel: {
      fontSize: 14,
      color: colors.text,
      width: 20,
      marginRight: 8,
    },
    progressBarContainer: {
      flex: 1,
      height: 8,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: 4,
      marginHorizontal: 8,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#FFD700',
      borderRadius: 4,
    },
    countLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      width: 30,
      textAlign: 'right',
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    summaryItem: {
      alignItems: 'center',
      flex: 1,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  const getProgressWidth = (count: number): string => {
    if (stats.totalReviews === 0) return '0%';
    return `${(count / stats.totalReviews) * 100}%`;
  };

  const getProgressWidthAsPercent = (count: number): number => {
    if (stats.totalReviews === 0) return 0;
    return (count / stats.totalReviews) * 100;
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Header with average rating */}
      <View style={styles.header}>
        <Text style={styles.averageRating}>
          {stats.averageRating.toFixed(1)}
        </Text>
        
        <View style={styles.ratingInfo}>
          <StarRating 
            rating={stats.averageRating} 
            readonly 
            size={20}
            showHalfStars 
          />
          <Text style={styles.totalReviews}>
            Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Rating distribution */}
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map((rating) => (
          <View key={rating} style={styles.distributionRow}>
            <Text style={styles.starLabel}>{rating}</Text>
            <StarRating rating={1} readonly size={12} maxRating={1} />
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${getProgressWidthAsPercent(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])}%` }
                ]} 
              />
            </View>
            
            <Text style={styles.countLabel}>
              {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
            </Text>
          </View>
        ))}
      </View>

      {/* Summary statistics */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {stats.verifiedPurchasePercentage.toFixed(0)}%
          </Text>
          <Text style={styles.summaryLabel}>Verified{'\n'}Purchases</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {stats.recommendationPercentage.toFixed(0)}%
          </Text>
          <Text style={styles.summaryLabel}>Would{'\n'}Recommend</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {stats.totalReviews > 0 ? 
              (stats.ratingDistribution[5] / stats.totalReviews * 100).toFixed(0) : 0}%
          </Text>
          <Text style={styles.summaryLabel}>5-Star{'\n'}Reviews</Text>
        </View>
      </View>
    </View>
  );
};

export default ReviewStats;