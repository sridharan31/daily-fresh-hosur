// src/types/review.ts
export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId?: string;  // Optional for cases where product is reviewed without purchase
  rating: number;    // 1-5 stars
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isRecommended?: boolean;
  helpfulVotes: number;
  totalVotes: number;
  replies?: ReviewReply[];
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
}

export interface ReviewUser {
  id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
  reviewCount?: number;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  userType: 'admin' | 'customer';
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchasePercentage: number;
  recommendationPercentage: number;
}

export interface AddReviewRequest {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isRecommended?: boolean;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
  isRecommended?: boolean;
}

export interface ReviewFilters {
  rating?: number;  // Filter by specific rating
  verifiedOnly?: boolean;
  withPhotos?: boolean;
  sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating_high' | 'rating_low';
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface HelpfulVoteRequest {
  reviewId: string;
  isHelpful: boolean;
}