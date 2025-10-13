 import { formatHelpers } from './helpers';

export const formatters = {
  ...formatHelpers,
  
  formatCardNumber: (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  },
  
  formatExpiryDate: (expiryDate: string): string => {
    const cleaned = expiryDate.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  },
  
  maskCardNumber: (cardNumber: string): string => {
    if (cardNumber.length < 4) return cardNumber;
    return '**** **** **** ' + cardNumber.slice(-4);
  },
  
  formatLoyaltyPoints: (points: number): string => {
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  },
  
  formatRating: (rating: number): string => {
    return rating.toFixed(1);
  },
  
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },
  
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};
