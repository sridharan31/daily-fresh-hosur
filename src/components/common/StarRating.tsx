// src/components/common/StarRating.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useThemeContext } from '../../contexts/ThemeContext';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  showHalfStars?: boolean;
  starSpacing?: number;
  testID?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  onRatingChange,
  readonly = false,
  showHalfStars = true,
  starSpacing = 2,
  testID = 'star-rating',
}) => {
  const { colors } = useThemeContext();

  const handleStarPress = (starIndex: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(starIndex + 1);
  };

  const renderStar = (starIndex: number) => {
    const isFilled = rating >= starIndex + 1;
    const isHalfFilled = showHalfStars && rating > starIndex && rating < starIndex + 1;
    
    let iconName = 'star-border';
    let iconColor = colors.textSecondary;
    
    if (isFilled) {
      iconName = 'star';
      iconColor = '#FFD700'; // Gold color for filled stars
    } else if (isHalfFilled) {
      iconName = 'star-half';
      iconColor = '#FFD700';
    }

    const starComponent = (
      <Icon
        name={iconName}
        size={size}
        color={iconColor}
        style={[
          styles.star,
          { marginHorizontal: starSpacing / 2 }
        ]}
      />
    );

    if (readonly) {
      return (
        <View key={starIndex} testID={`${testID}-star-${starIndex}`}>
          {starComponent}
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={starIndex}
        onPress={() => handleStarPress(starIndex)}
        activeOpacity={0.7}
        testID={`${testID}-star-${starIndex}`}
        accessibilityLabel={`Rate ${starIndex + 1} star${starIndex > 0 ? 's' : ''}`}
        accessibilityRole="button"
      >
        {starComponent}
      </TouchableOpacity>
    );
  };

  return (
    <View 
      style={[styles.container, { marginHorizontal: -starSpacing / 2 }]} 
      testID={testID}
      accessibilityLabel={`Rating: ${rating} out of ${maxRating} stars`}
    >
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    // Base star styling
  },
});

export default StarRating;