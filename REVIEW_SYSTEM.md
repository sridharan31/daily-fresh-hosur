# Review System Documentation

This document explains the comprehensive review system implemented for the Grocery Delivery App.

## Features

### ✅ Complete Review System
- **Read Reviews**: View all product reviews with detailed information
- **Add Review**: Write new reviews with ratings, comments, photos, and recommendations
- **Edit Review**: Update existing reviews (for review owners)
- **Delete Review**: Remove reviews (for review owners)
- **Vote Helpful**: Vote on review helpfulness
- **Report Review**: Report inappropriate reviews
- **Review Statistics**: View rating breakdowns and statistics
- **Filter Reviews**: Filter by rating, verified purchases, photos, etc.
- **Sort Reviews**: Sort by newest, oldest, most helpful, rating

### 🎯 Key Components

#### 1. **ReviewItem** (`app/components/review/ReviewItem.tsx`)
- Displays individual review with user info, rating, comment, images
- Supports verified purchase badges
- Includes helpful voting and action buttons
- Shows recommendation status

#### 2. **ReviewStats** (`app/components/review/ReviewStats.tsx`)
- Shows overall rating and distribution
- Displays verification and recommendation percentages
- Progress bars for rating breakdown

#### 3. **ReviewFilters** (`app/components/review/ReviewFilters.tsx`)
- Filter by rating (1-5 stars)
- Filter by verified purchases only
- Filter by reviews with photos
- Sort options (newest, oldest, helpful, rating)

#### 4. **ReviewsList** (`app/components/review/ReviewsList.tsx`)
- Main container for displaying reviews
- Handles pagination and infinite scrolling
- Integrates add review functionality
- Pull-to-refresh support

#### 5. **AddReviewModal** (`app/components/review/AddReviewModal.tsx`)
- Full-screen modal for writing/editing reviews
- Star rating selector
- Title and comment inputs
- Photo upload capability
- Recommendation checkbox

#### 6. **StarRating** (`app/components/common/StarRating.tsx`)
- Reusable star rating component
- Supports interactive and read-only modes
- Half-star support
- Customizable size and spacing

### 🔧 Hooks

#### **useReviews** (`app/hooks/useReviews.ts`)
Comprehensive hook for managing review data:

```typescript
const {
  reviews,           // Array of reviews
  stats,            // Review statistics
  loading,          // Loading state
  refreshing,       // Pull-to-refresh state
  hasMore,          // More reviews available
  filters,          // Current filters
  
  // Actions
  loadMore,         // Load more reviews
  refresh,          // Refresh reviews
  updateFilters,    // Update filter settings
  addReview,        // Add new review
  updateReview,     // Update existing review
  deleteReview,     // Delete review
  voteHelpful,      // Vote helpful on review
  removeVote,       // Remove helpful vote
  reportReview,     // Report inappropriate review
} = useReviews({ productId, initialFilters, limit });
```

### 🛠 Services

#### **reviewService** (`app/services/api/reviewService.ts`)
API service layer for review operations:

- `getProductReviews()` - Get paginated reviews for a product
- `getReviewStats()` - Get review statistics
- `addReview()` - Submit new review
- `updateReview()` - Update existing review
- `deleteReview()` - Delete review
- `voteHelpful()` - Vote on review helpfulness
- `reportReview()` - Report inappropriate content
- `uploadReviewImages()` - Upload review photos

### 📱 Screens

#### **ProductReviewsScreen** (`app/screens/reviews/ProductReviewsScreen.tsx`)
Full-screen reviews view with:
- Product information header
- Review statistics (collapsible)
- Filter options
- Complete reviews list
- Add review functionality

### 🔗 Integration

#### Product Detail Screen Integration
The existing product detail screen (`app/product/[id].tsx`) has been enhanced with:

1. **Read Reviews Button**: Navigate to full reviews screen
2. **Reviews Preview**: Shows limited reviews directly on product page
3. **Quick Access**: Easy navigation to full review experience

### 🚀 Usage Examples

#### Basic Review Display
```tsx
import { ReviewsList } from '../components/review';

function ProductScreen({ product }) {
  return (
    <ReviewsList
      product={product}
      currentUserId="user123"
      showAddReviewButton={true}
      maxHeight={400}
    />
  );
}
```

#### Custom Review Hook Usage
```tsx
import { useReviews } from '../hooks/useReviews';

function CustomReviewComponent({ productId }) {
  const {
    reviews,
    stats,
    addReview,
    updateFilters
  } = useReviews({ 
    productId,
    initialFilters: { sortBy: 'newest' },
    limit: 10
  });

  const handleAddReview = async (reviewData) => {
    const success = await addReview(reviewData);
    if (success) {
      console.log('Review added successfully!');
    }
  };

  return (
    <div>
      {stats && <p>Average: {stats.averageRating}/5</p>}
      {reviews.map(review => (
        <div key={review.id}>{review.comment}</div>
      ))}
    </div>
  );
}
```

### 🎨 Theming

All components are fully integrated with the app's theme system:
- Light/dark mode support
- Consistent color usage
- Responsive design
- Accessibility features

### 📋 Types

#### Core Types (`app/types/review.ts`)
- `Review` - Complete review object
- `ReviewStats` - Statistical data
- `ReviewFilters` - Filter options
- `AddReviewRequest` - New review data
- `UpdateReviewRequest` - Review update data

### 🛣 Navigation

#### Routes
- `/reviews/[productId]` - Full reviews screen for a product
- Accessible from product detail screens
- Deep linking support

### 📱 Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| ✅ Read Reviews | Complete | View all product reviews with pagination |
| ✅ Add Review | Complete | Write new reviews with rating and comments |
| ✅ Edit Review | Complete | Update existing reviews (owner only) |
| ✅ Delete Review | Complete | Remove reviews (owner only) |
| ✅ Rate Reviews | Complete | Vote helpful/unhelpful on reviews |
| ✅ Report Reviews | Complete | Report inappropriate content |
| ✅ Filter Reviews | Complete | Filter by rating, verified, photos |
| ✅ Sort Reviews | Complete | Sort by date, helpful, rating |
| ✅ Review Stats | Complete | Rating distribution and statistics |
| ✅ Photo Upload | UI Ready | Upload photos with reviews (backend needed) |
| ✅ Verified Badges | Complete | Show verified purchase status |
| ✅ Recommendations | Complete | Would recommend checkbox |
| ✅ Theme Support | Complete | Light/dark mode integration |
| ✅ Accessibility | Complete | Screen reader support |

### 🔄 Next Steps

1. **Backend Integration**: Connect to real API endpoints
2. **Image Upload**: Implement photo upload functionality
3. **Push Notifications**: Notify on review interactions
4. **Moderation**: Admin review moderation tools
5. **Analytics**: Track review engagement metrics

The review system is now fully functional and ready for backend integration!