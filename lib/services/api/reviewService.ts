// src/services/api/reviewService.ts
import { ApiResponse } from '../../types/api';
import {
    AddReviewRequest,
    HelpfulVoteRequest,
    Review,
    ReviewFilters,
    ReviewsResponse,
    ReviewStats,
    UpdateReviewRequest
} from '../../types/review';
import apiClient from './apiClient';

class ReviewService {
  // Get product reviews with pagination and filters
  async getProductReviews(
    productId: string, 
    page: number = 1, 
    limit: number = 20,
    filters?: ReviewFilters
  ): Promise<ApiResponse<ReviewsResponse>> {
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };
      
      if (filters) {
        if (filters.rating) params.rating = filters.rating.toString();
        if (filters.verifiedOnly) params.verifiedOnly = filters.verifiedOnly.toString();
        if (filters.withPhotos) params.withPhotos = filters.withPhotos.toString();
        if (filters.sortBy) params.sortBy = filters.sortBy;
      }
      
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get<ReviewsResponse>(
        `/products/${productId}/reviews?${queryString}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get review statistics for a product
  async getReviewStats(productId: string): Promise<ApiResponse<ReviewStats>> {
    try {
      const response = await apiClient.get<ReviewStats>(`/products/${productId}/reviews/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Add a new review
  async addReview(reviewData: AddReviewRequest): Promise<ApiResponse<Review>> {
    try {
      const response = await apiClient.post<Review>('/reviews', reviewData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update existing review
  async updateReview(reviewId: string, updateData: UpdateReviewRequest): Promise<ApiResponse<Review>> {
    try {
      const response = await apiClient.put<Review>(`/reviews/${reviewId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete review
  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(`/reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's reviews
  async getUserReviews(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<ApiResponse<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await apiClient.get<{
        reviews: Review[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
      }>(`/users/${userId}/reviews?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Vote helpful on a review
  async voteHelpful(voteData: HelpfulVoteRequest): Promise<ApiResponse<{ 
    helpfulVotes: number; 
    totalVotes: number; 
  }>> {
    try {
      const response = await apiClient.post<{ 
        helpfulVotes: number; 
        totalVotes: number; 
      }>(`/reviews/${voteData.reviewId}/vote`, {
        isHelpful: voteData.isHelpful
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Remove helpful vote
  async removeVote(reviewId: string): Promise<ApiResponse<{ 
    helpfulVotes: number; 
    totalVotes: number; 
  }>> {
    try {
      const response = await apiClient.delete<{ 
        helpfulVotes: number; 
        totalVotes: number; 
      }>(`/reviews/${reviewId}/vote`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Report a review
  async reportReview(reviewId: string, reason: string, description?: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>(`/reviews/${reviewId}/report`, {
        reason,
        description
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get review by ID
  async getReview(reviewId: string): Promise<ApiResponse<Review>> {
    try {
      const response = await apiClient.get<Review>(`/reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Check if user can review product
  async canReviewProduct(productId: string): Promise<ApiResponse<{
    canReview: boolean;
    reason?: string;
    existingReviewId?: string;
  }>> {
    try {
      const response = await apiClient.get<{
        canReview: boolean;
        reason?: string;
        existingReviewId?: string;
      }>(`/products/${productId}/can-review`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload review images
  async uploadReviewImages(images: string[]): Promise<ApiResponse<string[]>> {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`images`, {
          uri: image,
          type: 'image/jpeg',
          name: `review_image_${index}.jpg`,
        } as any);
      });

      const response = await apiClient.post<string[]>('/reviews/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const reviewService = new ReviewService();
export default reviewService;