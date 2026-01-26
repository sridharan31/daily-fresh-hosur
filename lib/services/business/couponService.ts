import { supabase } from '../../supabase/client';

export interface Coupon {
  id: string;
  code: string;
  title_en: string;
  description_en: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  show_in_list: boolean;
}

export const couponService = {
  // Validate a coupon code
  async validateCoupon(code: string, cartTotal: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        return { valid: false, error: 'Invalid coupon code' };
      }

      const coupon = data as Coupon;
      const now = new Date();

      if (new Date(coupon.valid_from) > now) {
        return { valid: false, error: 'Coupon is not yet valid' };
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return { valid: false, error: 'Coupon has expired' };
      }

      if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, error: 'Coupon usage limit reached' };
      }

      if (cartTotal < coupon.min_order_amount) {
        return { valid: false, error: `Minimum order amount of ₹${coupon.min_order_amount} required` };
      }

      return { valid: true, coupon };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { valid: false, error: 'Failed to validate coupon' };
    }
  },

  // Calculate discount amount
  calculateDiscount(coupon: Coupon, cartTotal: number): number {
    let discount = 0;
    
    if (coupon.discount_type === 'percentage') {
      discount = (cartTotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }

    return Math.min(discount, cartTotal); // Discount cannot exceed total
  },

  // Fetch all coupons (Admin)
  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Coupon[];
  },

  // Create a new coupon (Admin)
  async createCoupon(couponData: Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons' as any)
      .insert([{
        ...couponData,
        code: couponData.code.toUpperCase(),
        used_count: 0
      }] as any)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Coupon;
  },

  // Update a coupon (Admin)
  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons' as any)
      .update(updates as any)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Coupon;
  },

  // Delete/Deactivate a coupon (Admin)
  async deleteCoupon(id: string): Promise<void> {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Fetch public coupons for customers
  async getPublicCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .eq('show_in_list', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Coupon[];
  }
};
