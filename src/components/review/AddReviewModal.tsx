// src/components/review/AddReviewModal.tsx
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Product } from '../../../lib/types/product';
import { AddReviewRequest, Review, UpdateReviewRequest } from '../../../lib/types/review';
import { useThemeContext } from '../../contexts/ThemeContext';
import StarRating from '../common/StarRating';

interface AddReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reviewData: AddReviewRequest | UpdateReviewRequest) => Promise<boolean>;
  product: Product;
  existingReview?: Review;
  testID?: string;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  product,
  existingReview,
  testID = 'add-review-modal',
}) => {
  const { colors } = useThemeContext();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isRecommended, setIsRecommended] = useState(existingReview?.isRecommended || false);
  const [images, setImages] = useState<string[]>(existingReview?.images || []);
  const [loading, setLoading] = useState(false);

  const isEditing = !!existingReview;

  useEffect(() => {
    if (visible && !isEditing) {
      // Reset form when opening modal for new review
      setRating(0);
      setTitle('');
      setComment('');
      setIsRecommended(false);
      setImages([]);
    }
  }, [visible, isEditing]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating for this product.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Review Required', 'Please write a review comment.');
      return;
    }

    setLoading(true);

    try {
      const reviewData = isEditing
        ? {
            rating,
            title: title.trim() || undefined,
            comment: comment.trim(),
            isRecommended,
            images: images.length > 0 ? images : undefined,
          } as UpdateReviewRequest
        : {
            productId: product.id,
            rating,
            title: title.trim() || undefined,
            comment: comment.trim(),
            isRecommended,
            images: images.length > 0 ? images : undefined,
          } as AddReviewRequest;

      const success = await onSubmit(reviewData);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    // TODO: Implement image picker
    Alert.alert('Coming Soon', 'Image upload functionality will be available soon.');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getRatingLabel = (ratingValue: number): string => {
    switch (ratingValue) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Rate this product';
    }
  };

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    productSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    productUnit: {
      fontSize: 14,
      color: colors.textSecondary,
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
    ratingSection: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    ratingLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    ratingStars: {
      marginBottom: 12,
    },
    ratingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    titleInput: {
      height: 48,
    },
    commentInput: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    characterCount: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: 4,
    },
    recommendSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
      padding: 16,
    },
    recommendText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    recommendDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    imagesSection: {
      // Styles for image upload section
    },
    addImageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 8,
      padding: 20,
      backgroundColor: colors.backgroundSecondary,
    },
    addImageText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    imagesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    imageContainer: {
      position: 'relative',
    },
    reviewImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.error,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
    },
    submitButtonDisabled: {
      backgroundColor: colors.textTertiary,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textInverse,
    },
    submitButtonTextDisabled: {
      color: colors.textSecondary,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      testID={testID}
    >
      <SafeAreaView style={styles.modal}>
        <KeyboardAvoidingView 
          style={styles.modal} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Review' : 'Write a Review'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            {/* Product Info */}
            <View style={styles.productSection}>
              <Image
                source={{ uri: product.images[0] }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productUnit}>Per {product.unit}</Text>
              </View>
            </View>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overall Rating</Text>
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
                <View style={styles.ratingStars}>
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size={32}
                    starSpacing={8}
                  />
                </View>
                <Text style={styles.ratingDescription}>
                  Tap a star to rate this product
                </Text>
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Review Title (Optional)</Text>
              <TextInput
                style={[styles.input, styles.titleInput]}
                placeholder="Summarize your review in a few words"
                placeholderTextColor={colors.textTertiary}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <Text style={styles.characterCount}>{title.length}/100</Text>
            </View>

            {/* Comment Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Review</Text>
              <TextInput
                style={[styles.input, styles.commentInput]}
                placeholder="Tell others about your experience with this product..."
                placeholderTextColor={colors.textTertiary}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={1000}
              />
              <Text style={styles.characterCount}>{comment.length}/1000</Text>
            </View>

            {/* Images Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
              
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                <Icon name="add-a-photo" size={24} color={colors.textSecondary} />
                <Text style={styles.addImageText}>Add photos to your review</Text>
              </TouchableOpacity>

              {images.length > 0 && (
                <View style={styles.imagesGrid}>
                  {images.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: image }} style={styles.reviewImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Icon name="close" size={16} color={colors.textInverse} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Recommendation Section */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.recommendSection}
                onPress={() => setIsRecommended(!isRecommended)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.recommendText}>
                    Would you recommend this product?
                  </Text>
                  <Text style={styles.recommendDescription}>
                    Help other customers make informed decisions
                  </Text>
                </View>
                <Icon
                  name={isRecommended ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={isRecommended ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || !comment.trim() || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || !comment.trim() || loading}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  (rating === 0 || !comment.trim() || loading) && styles.submitButtonTextDisabled,
                ]}
              >
                {loading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default AddReviewModal;