// src/hooks/useReviews.ts
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import reviewService from '../../lib/services/api/reviewService';
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

  // Load reviews
  const loadReviews = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      }
      setError(null);

      const response = await reviewService.getProductReviews(productId, page, limit, filters);
      
      if (response.success && response.data) {
        const { reviews: newReviews, stats: reviewStats, hasMore: moreAvailable } = response.data;
        
        if (append && page > 1) {
          setReviews(prev => [...prev, ...newReviews]);
        } else {
          setReviews(newReviews);
          setStats(reviewStats);
        }
        
        setHasMore(moreAvailable);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to load reviews');
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
      const response = await reviewService.addReview(reviewData);
      
      if (response.success && response.data) {
        // Add the new review to the top of the list
        setReviews(prev => [response.data!, ...prev]);
        
        // Update stats if available
        if (stats) {
          const newStats = { ...stats };
          newStats.totalReviews += 1;
          const newTotal = newStats.averageRating * (newStats.totalReviews - 1) + reviewData.rating;
          newStats.averageRating = newTotal / newStats.totalReviews;
          
          // Update rating distribution
          const ratingKey = reviewData.rating as keyof typeof newStats.ratingDistribution;
          newStats.ratingDistribution[ratingKey] += 1;
          
          setStats(newStats);
        }
        
        Alert.alert('Success', 'Your review has been submitted successfully!');
        return true;
      } else {
        Alert.alert('Error', response.message || 'Failed to submit review');
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
      const response = await reviewService.updateReview(reviewId, updateData);
      
      if (response.success && response.data) {
        // Update the review in the list
        setReviews(prev => prev.map(review => 
          review.id === reviewId ? response.data! : review
        ));
        
        Alert.alert('Success', 'Your review has been updated successfully!');
        return true;
      } else {
        Alert.alert('Error', response.message || 'Failed to update review');
        return false;
      }
    } catch (err: any) {
      console.error('Error updating review:', err);
      Alert.alert('Error', err.message || 'Failed to update review');
      return false;
    }
  }, []);

  // Delete review
  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      const response = await reviewService.deleteReview(reviewId);
      
      if (response.success) {
        // Remove the review from the list
        setReviews(prev => prev.filter(review => review.id !== reviewId));
        
        // Update stats
        if (stats) {
          const newStats = { ...stats };
          newStats.totalReviews = Math.max(0, newStats.totalReviews - 1);
          setStats(newStats);
        }
        
        Alert.alert('Success', 'Review deleted successfully!');
        return true;
      } else {
        Alert.alert('Error', response.message || 'Failed to delete review');
        return false;
      }
    } catch (err: any) {
      console.error('Error deleting review:', err);
      Alert.alert('Error', err.message || 'Failed to delete review');
      return false;
    }
  }, [stats]);

  // Vote helpful on review
  const voteHelpful = useCallback(async (reviewId: string, isHelpful: boolean): Promise<boolean> => {
    try {
      const response = await reviewService.voteHelpful({ reviewId, isHelpful });
      
      if (response.success && response.data) {
        // Update the review's helpful votes
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                helpfulVotes: response.data!.helpfulVotes,
                totalVotes: response.data!.totalVotes
              }
            : review
        ));
        return true;
      } else {
        Alert.alert('Error', response.message || 'Failed to vote on review');
        return false;
      }
    } catch (err: any) {
      console.error('Error voting on review:', err);
      Alert.alert('Error', err.message || 'Failed to vote on review');
      return false;
    }
  }, []);

  // Remove vote on review
  const removeVote = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      const response = await reviewService.removeVote(reviewId);
      
      if (response.success && response.data) {
        // Update the review's helpful votes
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                helpfulVotes: response.data!.helpfulVotes,
                totalVotes: response.data!.totalVotes
              }
            : review
        ));
        return true;
      } else {
        Alert.alert('Error', response.message || 'Failed to remove vote');
        return false;
      }
    } catch (err: any) {
      console.error('Error removing vote:', err);
      Alert.alert('Error', err.message || 'Failed to remove vote');
      return false;
    }
  }, []);

  // Report review
  const reportReview = useCallback(async (reviewId: string, reason: string, description?: string): Promise<boolean> => {
    try {
      const response = await reviewService.reportReview(reviewId, reason, description);
      
      if (response.success) {
        Alert.alert('Success', 'Review has been reported. Thank you for helping us maintain quality standards.');
        return true;
      } else {
        Alert.alert('Error', response.message || 'Failed to report review');
        return false;
      }
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