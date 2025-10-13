// src/components/review/ReviewItem.tsx
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Review } from '../../../lib/types/review';
import { useThemeContext } from '../../contexts/ThemeContext';
import StarRating from '../common/StarRating';

interface ReviewItemProps {
  review: Review;
  onVoteHelpful?: (reviewId: string, isHelpful: boolean) => void;
  onRemoveVote?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
  isOwner?: boolean;
  testID?: string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onVoteHelpful,
  onRemoveVote,
  onReport,
  onEdit,
  onDelete,
  showActions = true,
  isOwner = false,
  testID = 'review-item',
}) => {
  const { colors } = useThemeContext();
  const [hasVoted, setHasVoted] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleVoteHelpful = (isHelpful: boolean) => {
    if (hasVoted) {
      onRemoveVote?.(review.id);
      setHasVoted(false);
    } else {
      onVoteHelpful?.(review.id, isHelpful);
      setHasVoted(true);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Review',
      'Why are you reporting this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Inappropriate Content', 
          onPress: () => onReport?.(review.id)
        },
        { 
          text: 'Spam', 
          onPress: () => onReport?.(review.id)
        },
        { 
          text: 'Fake Review', 
          onPress: () => onReport?.(review.id)
        },
        { 
          text: 'Other', 
          onPress: () => onReport?.(review.id)
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete?.(review.id)
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundSecondary,
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarText: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: 'bold',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    userMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.success + '20',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    verifiedText: {
      fontSize: 10,
      color: colors.success,
      fontWeight: '600',
      marginLeft: 2,
    },
    date: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    moreButton: {
      padding: 4,
    },
    ratingSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    ratingText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    comment: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    showMoreButton: {
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    showMoreText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    imagesContainer: {
      marginBottom: 12,
    },
    imagesScrollView: {
      paddingVertical: 4,
    },
    reviewImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 8,
    },
    recommendedSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.success + '10',
      borderRadius: 8,
    },
    recommendedText: {
      fontSize: 14,
      color: colors.success,
      fontWeight: '500',
      marginLeft: 8,
    },
    actionsSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    helpfulSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    helpfulButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    helpfulButtonActive: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    helpfulText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    helpfulTextActive: {
      color: colors.primary,
      fontWeight: '500',
    },
    helpfulCount: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    rightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionButton: {
      padding: 6,
      borderRadius: 6,
    },
    editButton: {
      backgroundColor: colors.warning + '20',
    },
    deleteButton: {
      backgroundColor: colors.error + '20',
    },
    reportButton: {
      backgroundColor: colors.textSecondary + '20',
    },
  });

  const truncatedComment = review.comment && review.comment.length > 200 
    ? review.comment.substring(0, 200) + '...' 
    : review.comment;

  const shouldShowMoreButton = review.comment && review.comment.length > 200;

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {review.user.avatar ? (
            <Image source={{ uri: review.user.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {review.user.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{review.user.name}</Text>
          <View style={styles.userMeta}>
            {review.isVerifiedPurchase && (
              <View style={styles.verifiedBadge}>
                <Icon name="verified" size={12} color={colors.success} />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            )}
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>

        {showActions && !isOwner && (
          <TouchableOpacity style={styles.moreButton} onPress={handleReport}>
            <Icon name="more-vert" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Rating */}
      <View style={styles.ratingSection}>
        <StarRating rating={review.rating} readonly size={16} />
        <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
      </View>

      {/* Title */}
      {review.title && (
        <Text style={styles.title}>{review.title}</Text>
      )}

      {/* Comment */}
      {review.comment && (
        <>
          <Text style={styles.comment}>
            {showFullComment ? review.comment : truncatedComment}
          </Text>
          {shouldShowMoreButton && (
            <TouchableOpacity 
              style={styles.showMoreButton}
              onPress={() => setShowFullComment(!showFullComment)}
            >
              <Text style={styles.showMoreText}>
                {showFullComment ? 'Show Less' : 'Show More'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <View style={styles.imagesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScrollView}
          >
            {review.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image source={{ uri: image }} style={styles.reviewImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recommended */}
      {review.isRecommended && (
        <View style={styles.recommendedSection}>
          <Icon name="thumb-up" size={16} color={colors.success} />
          <Text style={styles.recommendedText}>Recommends this product</Text>
        </View>
      )}

      {/* Actions */}
      {showActions && (
        <View style={styles.actionsSection}>
          <View style={styles.helpfulSection}>
            <TouchableOpacity
              style={[
                styles.helpfulButton,
                hasVoted && styles.helpfulButtonActive,
              ]}
              onPress={() => handleVoteHelpful(true)}
            >
              <Icon 
                name="thumb-up" 
                size={14} 
                color={hasVoted ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.helpfulText,
                hasVoted && styles.helpfulTextActive,
              ]}>
                Helpful
              </Text>
            </TouchableOpacity>
            
            {review.helpfulVotes > 0 && (
              <Text style={styles.helpfulCount}>
                {review.helpfulVotes} found this helpful
              </Text>
            )}
          </View>

          {isOwner && (
            <View style={styles.rightActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEdit?.(review)}
              >
                <Icon name="edit" size={16} color={colors.warning} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Icon name="delete" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default ReviewItem;