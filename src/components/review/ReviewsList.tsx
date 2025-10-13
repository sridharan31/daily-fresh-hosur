// src/components/review/ReviewsList.tsx
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product } from '../../../lib/types/product';
import { Review } from '../../../lib/types/review';
import { useThemeContext } from '../../contexts/ThemeContext';
import useReviews from '../../hooks/useReviews';
import AddReviewModal from './AddReviewModal';
import ReviewItem from './ReviewItem';

interface ReviewsListProps {
  product: Product;
  currentUserId?: string;
  showAddReviewButton?: boolean;
  maxHeight?: number;
  testID?: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  product,
  currentUserId,
  showAddReviewButton = true,
  maxHeight,
  testID = 'reviews-list',
}) => {
  const { colors } = useThemeContext();
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const {
    reviews,
    loading,
    refreshing,
    hasMore,
    refresh,
    loadMore,
    addReview,
    updateReview,
    deleteReview,
    voteHelpful,
    removeVote,
    reportReview,
  } = useReviews({ productId: product.id });

  const handleAddReview = useCallback(async (reviewData: any) => {
    const success = await addReview(reviewData);
    return success;
  }, [addReview]);

  const handleUpdateReview = useCallback(async (reviewData: any) => {
    if (!editingReview) return false;
    const success = await updateReview(editingReview.id, reviewData);
    if (success) {
      setEditingReview(null);
    }
    return success;
  }, [editingReview, updateReview]);

  const handleEditReview = useCallback((review: Review) => {
    setEditingReview(review);
    setShowAddReviewModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowAddReviewModal(false);
    setEditingReview(null);
  }, []);

  const handleReportReview = useCallback((reviewId: string) => {
    // For now, just report with a generic reason
    reportReview(reviewId, 'inappropriate', 'Reported by user');
  }, [reportReview]);

  const renderReviewItem = useCallback(({ item }: { item: Review }) => (
    <ReviewItem
      review={item}
      onVoteHelpful={voteHelpful}
      onRemoveVote={removeVote}
      onReport={handleReportReview}
      onEdit={handleEditReview}
      onDelete={deleteReview}
      isOwner={item.userId === currentUserId}
      testID={`${testID}-review-${item.id}`}
    />
  ), [voteHelpful, removeVote, reportReview, handleEditReview, deleteReview, currentUserId, testID]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Loading more reviews...
        </Text>
      </View>
    );
  }, [hasMore, colors]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Icon name="rate-review" size={48} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Reviews Yet
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Be the first to share your experience with this product
      </Text>
      {showAddReviewButton && (
        <TouchableOpacity
          style={[styles.addReviewButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddReviewModal(true)}
        >
          <Icon name="add" size={20} color={colors.textInverse} />
          <Text style={[styles.addReviewButtonText, { color: colors.textInverse }]}>
            Write First Review
          </Text>
        </TouchableOpacity>
      )}
    </View>
  ), [colors, showAddReviewButton]);

  const renderHeader = useCallback(() => {
    if (reviews.length === 0) return null;

    return showAddReviewButton ? (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={[styles.addReviewButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddReviewModal(true)}
        >
          <Icon name="add" size={20} color={colors.textInverse} />
          <Text style={[styles.addReviewButtonText, { color: colors.textInverse }]}>
            Write a Review
          </Text>
        </TouchableOpacity>
      </View>
    ) : null;
  }, [reviews.length, showAddReviewButton, colors]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
    },
    headerContainer: {
      paddingBottom: 16,
    },
    addReviewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    addReviewButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    footerLoader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    },
    footerText: {
      fontSize: 14,
      marginLeft: 8,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
    },
    loadingText: {
      fontSize: 14,
      marginTop: 12,
    },
  });

  if (loading && reviews.length === 0) {
    return (
      <View style={[styles.loadingContainer, maxHeight ? { maxHeight } : undefined]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading reviews...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, maxHeight ? { maxHeight } : undefined]} testID={testID}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />

      {/* Add/Edit Review Modal */}
      <AddReviewModal
        visible={showAddReviewModal}
        onClose={handleCloseModal}
        onSubmit={editingReview ? handleUpdateReview : handleAddReview}
        product={product}
        existingReview={editingReview || undefined}
        testID={`${testID}-add-review-modal`}
      />
    </View>
  );
};

export default ReviewsList;