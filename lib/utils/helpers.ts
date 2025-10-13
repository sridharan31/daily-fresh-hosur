 import { Dimensions, Platform } from 'react-native';
import { VALIDATION_RULES } from './constants';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export const deviceHelpers = {
  isTablet: () => screenWidth >= 768,
  isSmallScreen: () => screenWidth < 375,
  screenWidth,
  screenHeight,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  statusBarHeight: Platform.OS === 'ios' ? 44 : 0,
};

export const formatHelpers = {
  formatPrice: (amount: number, currency: string = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },
  
  formatDate: (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('en-GB');
      case 'long':
        return dateObj.toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'time':
        return dateObj.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });
      default:
        return dateObj.toLocaleDateString('en-GB');
    }
  },
  
  formatPhoneNumber: (phone: string): string => {
    // Format UAE phone numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('971')) {
      return `+971 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    if (cleaned.startsWith('05')) {
      return `+971 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  },
  
  formatOrderNumber: (orderNumber: string): string => {
    return `#${orderNumber}`;
  },
  
  formatDistance: (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  },
  
  formatWeight: (weight: number, unit: string): string => {
    if (unit === 'grams' && weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}kg`;
    }
    return `${weight}${unit === 'grams' ? 'g' : unit}`;
  },
};

export const validationHelpers = {
  isValidEmail: (email: string): boolean => {
    return VALIDATION_RULES.EMAIL.test(email);
  },
  
  isValidPhoneUAE: (phone: string): boolean => {
    return VALIDATION_RULES.PHONE_UAE.test(phone);
  },
  
  isValidPassword: (password: string): boolean => {
    return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
  },
  
  isValidOTP: (otp: string): boolean => {
    return otp.length === VALIDATION_RULES.OTP_LENGTH && /^\d+$/.test(otp);
  },
  
  isValidPincode: (pincode: string): boolean => {
    return VALIDATION_RULES.PINCODE_UAE.test(pincode);
  },
  
  getPasswordStrength: (password: string): 'weak' | 'medium' | 'strong' => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  },
};

export const storageHelpers = {
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  },
  
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },
  
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },
  
  capitalizeFirstLetter: (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  
  truncateText: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  },
};

