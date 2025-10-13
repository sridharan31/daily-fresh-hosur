// app/services/business/priceCalculator.ts
import Config from '../../../src/config/environment';

interface PriceCalculation {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  vatAmount: number;
  total: number;
}

interface CartItem {
  price: number;
  discountedPrice?: number;
  quantity: number;
}

interface DiscountRule {
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number;
  minimumAmount?: number;
  minimumQuantity?: number;
  maxDiscount?: number;
  applicableProducts?: string[];
}

class PriceCalculatorService {
  private readonly currency = Config.DEFAULT_CURRENCY;
  private readonly vatRate = Config.VAT_RATE;
  private readonly freeDeliveryThreshold = Config.FREE_DELIVERY_THRESHOLD;
  private readonly standardDeliveryCharge = Config.STANDARD_DELIVERY_CHARGE;
  private readonly expressDeliveryCharge = Config.EXPRESS_DELIVERY_CHARGE;

  /**
   * Format price according to currency and locale
   */
  formatPrice(amount: number, showCurrency = true): string {
    const formattedAmount = amount.toFixed(2);
    
    if (showCurrency) {
      switch (this.currency) {
        case 'AED':
          return `AED ${formattedAmount}`;
        case 'USD':
          return `$${formattedAmount}`;
        case 'EUR':
          return `€${formattedAmount}`;
        case 'INR':
          return `₹${formattedAmount}`;
        default:
          return `${this.currency} ${formattedAmount}`;
      }
    }
    
    return formattedAmount;
  }

  /**
   * Get VAT display text based on configuration
   */
  getVATDisplayText(): string {
    const vatPercentage = (this.vatRate * 100).toFixed(0);
    return `VAT (${vatPercentage}%)`;
  }

  /**
   * Calculate VAT amount
   */
  calculateVAT(amount: number): number {
    return amount * this.vatRate;
  }

  /**
   * Calculate subtotal from cart items
   */
  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      const itemPrice = item.discountedPrice || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  }

  /**
   * Calculate delivery charge based on subtotal and delivery type
   */
  calculateDeliveryCharge(subtotal: number, isExpressDelivery = false): number {
    if (subtotal >= this.freeDeliveryThreshold) {
      return isExpressDelivery ? this.expressDeliveryCharge - this.standardDeliveryCharge : 0;
    }
    
    return isExpressDelivery ? this.expressDeliveryCharge : this.standardDeliveryCharge;
  }

  /**
   * Calculate discount based on rules
   */
  calculateDiscount(
    items: CartItem[],
    discountRules: DiscountRule[] = [],
    couponCode?: string
  ): number {
    let totalDiscount = 0;
    const subtotal = this.calculateSubtotal(items);

    // Apply item-level discounts (already included in discountedPrice)
    const itemDiscounts = items.reduce((total, item) => {
      if (item.discountedPrice && item.discountedPrice < item.price) {
        const itemDiscount = (item.price - item.discountedPrice) * item.quantity;
        return total + itemDiscount;
      }
      return total;
    }, 0);

    totalDiscount += itemDiscounts;

    // Apply additional discount rules
    for (const rule of discountRules) {
      let ruleDiscount = 0;

      switch (rule.type) {
        case 'percentage':
          if (subtotal >= (rule.minimumAmount || 0)) {
            ruleDiscount = subtotal * (rule.value / 100);
            if (rule.maxDiscount) {
              ruleDiscount = Math.min(ruleDiscount, rule.maxDiscount);
            }
          }
          break;

        case 'fixed':
          if (subtotal >= (rule.minimumAmount || 0)) {
            ruleDiscount = rule.value;
          }
          break;

        case 'buy_x_get_y':
          // Implement buy X get Y logic
          const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
          if (totalQuantity >= (rule.minimumQuantity || 0)) {
            ruleDiscount = rule.value;
          }
          break;
      }

      totalDiscount += ruleDiscount;
    }

    return Math.max(0, totalDiscount);
  }

  /**
   * Calculate complete price breakdown
   */
  calculateTotal(
    items: CartItem[],
    isExpressDelivery = false,
    discountRules: DiscountRule[] = [],
    couponCode?: string
  ): PriceCalculation {
    const subtotal = this.calculateSubtotal(items);
    const discount = this.calculateDiscount(items, discountRules, couponCode);
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const deliveryCharge = this.calculateDeliveryCharge(subtotalAfterDiscount, isExpressDelivery);
    const vatAmount = this.calculateVAT(subtotalAfterDiscount + deliveryCharge);
    const total = subtotalAfterDiscount + deliveryCharge + vatAmount;

    return {
      subtotal,
      discount,
      deliveryCharge,
      vatAmount,
      total,
    };
  }

  /**
   * Calculate amount needed for free delivery
   */
  getAmountForFreeDelivery(currentSubtotal: number): number {
    if (currentSubtotal >= this.freeDeliveryThreshold) {
      return 0;
    }
    return this.freeDeliveryThreshold - currentSubtotal;
  }

  /**
   * Check if eligible for free delivery
   */
  isEligibleForFreeDelivery(subtotal: number): boolean {
    return subtotal >= this.freeDeliveryThreshold;
  }

  /**
   * Format price range (for product listings)
   */
  formatPriceRange(minPrice: number, maxPrice: number): string {
    if (minPrice === maxPrice) {
      return this.formatPrice(minPrice);
    }
    return `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`;
  }

  /**
   * Calculate percentage discount
   */
  calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }

  /**
   * Apply coupon discount
   */
  applyCouponDiscount(
    subtotal: number,
    couponType: 'percentage' | 'fixed',
    couponValue: number,
    maxDiscount?: number,
    minOrderAmount?: number
  ): number {
    if (minOrderAmount && subtotal < minOrderAmount) {
      return 0;
    }

    let discount = 0;
    
    if (couponType === 'percentage') {
      discount = subtotal * (couponValue / 100);
      if (maxDiscount) {
        discount = Math.min(discount, maxDiscount);
      }
    } else {
      discount = couponValue;
    }

    return Math.min(discount, subtotal);
  }

  /**
   * Round to nearest currency unit (for some currencies)
   */
  roundToCurrency(amount: number): number {
    // For most currencies, round to 2 decimal places
    return Math.round(amount * 100) / 100;
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(): string {
    switch (this.currency) {
      case 'AED':
        return 'د.إ';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'INR':
        return '₹';
      case 'GBP':
        return '£';
      default:
        return this.currency;
    }
  }

  /**
   * Format currency without symbol (for calculations)
   */
  formatAmountOnly(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * Parse price string to number
   */
  parsePrice(priceString: string): number {
    // Remove currency symbols and parse
    const cleanPrice = priceString.replace(/[^\d.-]/g, '');
    return parseFloat(cleanPrice) || 0;
  }

  /**
   * Calculate bulk discount based on quantity
   */
  calculateBulkDiscount(quantity: number, pricePerUnit: number): number {
    let discountPercentage = 0;

    // Example bulk discount tiers
    if (quantity >= 50) {
      discountPercentage = 0.15; // 15% for 50+ items
    } else if (quantity >= 20) {
      discountPercentage = 0.10; // 10% for 20+ items
    } else if (quantity >= 10) {
      discountPercentage = 0.05; // 5% for 10+ items
    }

    return pricePerUnit * quantity * discountPercentage;
  }

  /**
   * Calculate loyalty points based on purchase amount
   */
  calculateLoyaltyPoints(purchaseAmount: number): number {
    // 1 point per AED spent (or equivalent in other currencies)
    return Math.floor(purchaseAmount);
  }

  /**
   * Convert loyalty points to discount amount
   */
  convertPointsToDiscount(points: number, conversionRate = 0.01): number {
    // Default: 100 points = 1 AED discount
    return points * conversionRate;
  }
}

// Export singleton instance
const priceCalculator = new PriceCalculatorService();
export default priceCalculator;

// Export types for use in other modules
export type { DiscountRule, PriceCalculation };

