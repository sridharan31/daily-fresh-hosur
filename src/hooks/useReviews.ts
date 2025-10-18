// src/hooks/useReviews.ts
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import productService from '../../lib/services/productService';
import {
  AddReviewRequest,
  Review,
  ReviewFilters,
  ReviewStats,
  UpdateReviewRequest
} from '../../lib/types/review';

interface UseReviewsProps {
  productId: string;
  initialFilters?: ReviewFilters;
  limit?: number;
}

interface UseReviewsReturn {
  reviews: Review[];
  stats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  filters: ReviewFilters;
  refreshing: boolean;
  
  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  updateFilters: (newFilters: ReviewFilters) => void;
  addReview: (reviewData: AddReviewRequest) => Promise<boolean>;
  updateReview: (reviewId: string, updateData: UpdateReviewRequest) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  voteHelpful: (reviewId: string, isHelpful: boolean) => Promise<boolean>;
  removeVote: (reviewId: string) => Promise<boolean>;
  reportReview: (reviewId: string, reason: string, description?: string) => Promise<boolean>;
}

export const useReviews = ({ 
  productId, 
  initialFilters = {}, 
  limit = 20 
}: UseReviewsProps): UseReviewsReturn => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<ReviewFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);

  // Load reviews using Supabase
  const loadReviews = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      }
      setError(null);

      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Use Supabase-based productService
      const newReviews = await productService.getProductReviews(productId, limit, offset);
      
      if (newReviews) {
        // Convert to the expected Review format if necessary
        const formattedReviews: Review[] = newReviews.map(review => ({
          id: review.id,
          productId: review.product_id,
          userId: review.user_id,
          rating: review.rating,
          title: review.title || '',
          comment: review.comment || '',
          images: review.images || [],
          createdAt: review.created_at,
          updatedAt: review.updated_at || review.created_at,
          helpfulVotes: review.helpful_count || 0,
          totalVotes: review.total_votes || 0,
          isVerifiedPurchase: review.is_verified_purchase || false,
          // Create a user object that matches the ReviewUser type
          user: {
            id: review.user_id,
            name: review.users?.full_name || 'Anonymous',
            avatar: review.users?.avatar_url || undefined,
          }
        }));

        // Get review stats (if available)
        // For now, we'll create a simplified stats object
        const reviewStats: ReviewStats = {
          averageRating: newReviews.reduce((acc, curr) => acc + curr.rating, 0) / newReviews.length || 0,
          totalReviews: newReviews.length,
          ratingDistribution: {
            1: newReviews.filter(r => r.rating === 1).length,
            2: newReviews.filter(r => r.rating === 2).length,
            3: newReviews.filter(r => r.rating === 3).length,
            4: newReviews.filter(r => r.rating === 4).length,
            5: newReviews.filter(r => r.rating === 5).length,
          },
          verifiedPurchasePercentage: newReviews.filter(r => r.is_verified_purchase).length / newReviews.length * 100 || 0,
          recommendationPercentage: 0 // Not available from Supabase yet
        };
        
        if (append && page > 1) {
          setReviews(prev => [...prev, ...formattedReviews]);
        } else {
          setReviews(formattedReviews);
          setStats(reviewStats);
        }
        
        // Determine if there are more reviews to load
        // If we got back fewer reviews than the limit, there are no more
        setHasMore(newReviews.length === limit);
        setCurrentPage(page);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err: any) {
      console.error('Error loading reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId, filters, limit]);

  // Load more reviews (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadReviews(currentPage + 1, true);
  }, [hasMore, loading, currentPage, loadReviews]);

  // Refresh reviews
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadReviews(1, false);
  }, [loadReviews]);

  // Update filters
  const updateFilters = useCallback((newFilters: ReviewFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setReviews([]);
  }, []);

  // Add new review
  const addReview = useCallback(async (reviewData: AddReviewRequest): Promise<boolean> => {
    try {
      const response = await productService.addProductReview(
        productId,
        reviewData.orderId || '',
        reviewData.rating,
        reviewData.title || '',
        reviewData.comment || '',
        reviewData.images
      );
      
      if (response) {
        // Refresh reviews to include the newly added one
        await refresh();
        Alert.alert('Success', 'Your review has been submitted and will be visible after approval.');
        return true;
      } else {
        Alert.alert('Error', 'Failed to submit review. Please try again.');
        return false;
      }
    } catch (err: any) {
      console.error('Error adding review:', err);
      Alert.alert('Error', err.message || 'Failed to submit review');
      return false;
    }
  }, [stats]);

  // Update existing review
  const updateReview = useCallback(async (reviewId: string, updateData: UpdateReviewRequest): Promise<boolean> => {
    try {
      // This would need implementation in Supabase
      Alert.alert('Not Implemented', 'Review updating is not yet available with Supabase.');
      return false;
    } catch (err: any) {
      console.error('Error updating review:', err);
      Alert.alert('Error', err.message || 'Failed to update review');
      return false;
    }
  }, []);

  // Delete review
  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      // This would need implementation in Supabase
      Alert.alert('Not Implemented', 'Review deletion is not yet available with Supabase.');
      return false;
    } catch (err: any) {
      console.error('Error deleting review:', err);
      Alert.alert('Error', err.message || 'Failed to delete review');
      return false;
    }
  }, [stats]);

  // Vote helpful on review
  const voteHelpful = useCallback(async (reviewId: string, isHelpful: boolean): Promise<boolean> => {
    try {
      // This would need implementation in Supabase
      Alert.alert('Not Implemented', 'Review voting is not yet available with Supabase.');
      return false;
    } catch (err: any) {
      console.error('Error voting on review:', err);
      Alert.alert('Error', err.message || 'Failed to vote on review');
      return false;
    }
  }, []);

  // Remove vote on review
  const removeVote = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      // This would need implementation in Supabase
      Alert.alert('Not Implemented', 'Removing votes is not yet available with Supabase.');
      return false;
    } catch (err: any) {
      console.error('Error removing vote:', err);
      Alert.alert('Error', err.message || 'Failed to remove vote');
      return false;
    }
  }, []);

  // Report review
  const reportReview = useCallback(async (reviewId: string, reason: string, description?: string): Promise<boolean> => {
    try {
      // This would need implementation in Supabase
      Alert.alert('Not Implemented', 'Reporting reviews is not yet available with Supabase.');
      return false;
    } catch (err: any) {
      console.error('Error reporting review:', err);
      Alert.alert('Error', err.message || 'Failed to report review');
      return false;
    }
  }, []);

  // Load reviews when productId or filters change
  useEffect(() => {
    if (productId) {
      loadReviews(1, false);
    }
  }, [productId, filters, loadReviews]);

  return {
    reviews,
    stats,
    loading,
    error,
    hasMore,
    filters,
    refreshing,
    loadMore,
    refresh,
    updateFilters,
    addReview,
    updateReview,
    deleteReview,
    voteHelpful,
    removeVote,
    reportReview,
  };
};

export default useReviews;