 import { 
  addDays, 
  addHours, 
  addMinutes, 
  addMonths, 
  addWeeks, 
  differenceInDays, 
  differenceInHours, 
  differenceInMinutes, 
  endOfDay, 
  endOfMonth, 
  endOfWeek, 
  format, 
  getDay, 
  isAfter, 
  isBefore, 
  isSameDay, 
  isToday, 
  isTomorrow, 
  isValid, 
  isYesterday, 
  setHours, 
  setMinutes, 
  startOfDay, 
  startOfMonth, 
  startOfWeek, 
  subDays, 
  subHours, 
  subMinutes 
} from 'date-fns';

// Date format constants
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_DATE_SHORT: 'MMM dd',
  DISPLAY_TIME: 'hh:mm a',
  DISPLAY_DATETIME: 'MMM dd, yyyy hh:mm a',
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  ORDER_DATE: 'EEEE, MMM dd',
  DELIVERY_TIME: 'hh:mm a',
  FULL_DATE: 'EEEE, MMMM dd, yyyy',
  TIME_24: 'HH:mm',
  MONTH_YEAR: 'MMMM yyyy',
  DAY_MONTH: 'dd MMM',
  YEAR: 'yyyy',
} as const;

// Time slot interface for delivery scheduling
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  isAvailable: boolean;
  capacity?: number;
  bookedCount?: number;
}

// Delivery date option interface
export interface DeliveryDateOption {
  date: Date;
  dateString: string;
  displayLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

// Business hours interface
export interface BusinessHours {
  day: number; // 0 = Sunday, 1 = Monday, etc.
  dayName: string;
  isOpen: boolean;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
}

// Helper function to parse ISO string or return date
const parseDate = (date: Date | string): Date => {
  if (typeof date === 'string') {
    return new Date(date);
  }
  return date;
};

// Helper function for relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = differenceInMinutes(now, date);
  const diffInHours = differenceInHours(now, date);
  const diffInDays = differenceInDays(now, date);

  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else {
    return format(date, DATE_FORMATS.DISPLAY_DATE);
  }
};

// Helper function for time between dates
const getTimeBetweenDates = (start: Date, end: Date): string => {
  const diffInMinutes = differenceInMinutes(end, start);
  const diffInHours = differenceInHours(end, start);
  const diffInDays = differenceInDays(end, start);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
  } else {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
  }
};

// Helper function to check if date is within interval
const isDateWithinInterval = (date: Date, start: Date, end: Date): boolean => {
  return date >= start && date <= end;
};

// Helper function to get dates in range
const getDatesInDateRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

class DateUtils {
  // Format date for display
  formatDate(date: Date | string, formatString: string = DATE_FORMATS.DISPLAY_DATE): string {
    try {
      const dateObj = parseDate(date);
      if (!isValid(dateObj)) {
        return 'Invalid Date';
      }
      return format(dateObj, formatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  // Format time for display
  formatTime(date: Date | string, formatString: string = DATE_FORMATS.DISPLAY_TIME): string {
    return this.formatDate(date, formatString);
  }

  // Format datetime for display
  formatDateTime(date: Date | string, formatString: string = DATE_FORMATS.DISPLAY_DATETIME): string {
    return this.formatDate(date, formatString);
  }

  // Get relative time (e.g., "2 hours ago", "in 3 days")
  getRelativeTime(date: Date | string): string {
    try {
      const dateObj = parseDate(date);
      if (!isValid(dateObj)) {
        return 'Invalid Date';
      }
      return formatRelativeTime(dateObj);
    } catch (error) {
      console.error('Error getting relative time:', error);
      return 'Invalid Date';
    }
  }

  // Get time between two dates
  getTimeBetween(startDate: Date | string, endDate: Date | string): string {
    try {
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      if (!isValid(start) || !isValid(end)) {
        return 'Invalid Date';
      }
      
      return getTimeBetweenDates(start, end);
    } catch (error) {
      console.error('Error getting time between dates:', error);
      return 'Invalid Date';
    }
  }

  // Check if date is today
  isDateToday(date: Date | string): boolean {
    try {
      const dateObj = parseDate(date);
      return isValid(dateObj) && isToday(dateObj);
    } catch (error) {
      return false;
    }
  }

  // Check if date is tomorrow
  isDateTomorrow(date: Date | string): boolean {
    try {
      const dateObj = parseDate(date);
      return isValid(dateObj) && isTomorrow(dateObj);
    } catch (error) {
      return false;
    }
  }

  // Check if date is yesterday
  isDateYesterday(date: Date | string): boolean {
    try {
      const dateObj = parseDate(date);
      return isValid(dateObj) && isYesterday(dateObj);
    } catch (error) {
      return false;
    }
  }

  // Get display label for date (Today, Tomorrow, or formatted date)
  getDateDisplayLabel(date: Date | string): string {
    if (this.isDateToday(date)) {
      return 'Today';
    }
    if (this.isDateTomorrow(date)) {
      return 'Tomorrow';
    }
    if (this.isDateYesterday(date)) {
      return 'Yesterday';
    }
    return this.formatDate(date, DATE_FORMATS.ORDER_DATE);
  }

  // Get available delivery dates (next 7 days excluding unavailable dates)
  getAvailableDeliveryDates(
    excludeDates: Date[] = [],
    maxDays: number = 7,
    businessHours: BusinessHours[] = []
  ): DeliveryDateOption[] {
    const availableDates: DeliveryDateOption[] = [];
    const today = new Date();
    
    for (let i = 0; i < maxDays + excludeDates.length && availableDates.length < maxDays; i++) {
      const date = addDays(today, i);
      const dayOfWeek = getDay(date);
      
      // Check if date is excluded
      const isExcluded = excludeDates.some(excludeDate => 
        isSameDay(date, excludeDate)
      );
      
      // Check business hours if provided
      const businessHour = businessHours.find(bh => bh.day === dayOfWeek);
      const isBusinessOpen = !businessHours.length || (businessHour?.isOpen ?? true);
      
      if (!isExcluded && isBusinessOpen) {
        availableDates.push({
          date,
          dateString: this.formatDate(date, DATE_FORMATS.API_DATE),
          displayLabel: this.getDateDisplayLabel(date),
          isToday: this.isDateToday(date),
          isTomorrow: this.isDateTomorrow(date),
          isAvailable: true,
          timeSlots: this.generateTimeSlots(date, businessHour),
        });
      }
    }
    
    return availableDates;
  }

  // Generate time slots for a given date
  generateTimeSlots(
    date: Date,
    businessHour?: BusinessHours,
    slotDuration: number = 60, // minutes
    bufferTime: number = 30 // minutes buffer from current time
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const isToday = this.isDateToday(date);
    const now = new Date();
    
    // Default business hours if not provided
    const openTime = businessHour?.openTime || '09:00';
    const closeTime = businessHour?.closeTime || '21:00';
    
    // Parse business hours
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    // Set start time
    let startTime = setMinutes(setHours(date, openHour), openMinute);
    
    // If today, ensure start time is after current time + buffer
    if (isToday) {
      const minStartTime = addMinutes(now, bufferTime);
      if (isBefore(startTime, minStartTime)) {
        startTime = minStartTime;
        // Round up to next slot
        const minutes = startTime.getMinutes();
        const roundedMinutes = Math.ceil(minutes / slotDuration) * slotDuration;
        startTime = setMinutes(startTime, roundedMinutes);
      }
    }
    
    // Set end time
    const endTime = setMinutes(setHours(date, closeHour), closeMinute);
    
    // Generate slots
    let currentSlot = startTime;
    let slotId = 1;
    
    while (isBefore(currentSlot, endTime)) {
      const slotEnd = addMinutes(currentSlot, slotDuration);
      
      if (isBefore(slotEnd, endTime) || isSameDay(slotEnd, endTime)) {
        slots.push({
          id: `${this.formatDate(date, DATE_FORMATS.API_DATE)}-${slotId}`,
          startTime: this.formatTime(currentSlot, DATE_FORMATS.TIME_24),
          endTime: this.formatTime(slotEnd, DATE_FORMATS.TIME_24),
          label: `${this.formatTime(currentSlot)} - ${this.formatTime(slotEnd)}`,
          isAvailable: true,
        });
      }
      
      currentSlot = slotEnd;
      slotId++;
    }
    
    return slots;
  }

  // Check if delivery time is valid (not in the past)
  isValidDeliveryTime(date: Date | string, timeSlot: string): boolean {
    try {
      const deliveryDate = parseDate(date);
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const deliveryDateTime = setMinutes(setHours(deliveryDate, hours), minutes);
      
      return isAfter(deliveryDateTime, new Date());
    } catch (error) {
      return false;
    }
  }

  // Get order status time display
  getOrderStatusTime(orderDate: Date | string, status: string): string {
    const date = parseDate(orderDate);
    
    switch (status.toLowerCase()) {
      case 'placed':
      case 'confirmed':
        return `Ordered ${this.getRelativeTime(date)}`;
      case 'preparing':
        return `Preparing since ${this.formatTime(date)}`;
      case 'ready':
        return `Ready since ${this.formatTime(date)}`;
      case 'out_for_delivery':
        return `Out for delivery since ${this.formatTime(date)}`;
      case 'delivered':
        return `Delivered ${this.getRelativeTime(date)}`;
      case 'cancelled':
        return `Cancelled ${this.getRelativeTime(date)}`;
      default:
        return this.getRelativeTime(date);
    }
  }

  // Get estimated delivery time
  getEstimatedDeliveryTime(
    orderTime: Date | string,
    preparationMinutes: number = 30,
    deliveryMinutes: number = 30
  ): Date {
    const order = parseDate(orderTime);
    return addMinutes(order, preparationMinutes + deliveryMinutes);
  }

  // Format delivery time range
  formatDeliveryTimeRange(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  // Get business hours for a specific day
  getBusinessHoursForDay(day: number, businessHours: BusinessHours[]): BusinessHours | null {
    return businessHours.find(bh => bh.day === day) || null;
  }

  // Check if current time is within business hours
  isWithinBusinessHours(businessHours: BusinessHours[]): boolean {
    const now = new Date();
    const today = getDay(now);
    const currentTime = this.formatTime(now, DATE_FORMATS.TIME_24);
    
    const todayHours = this.getBusinessHoursForDay(today, businessHours);
    
    if (!todayHours || !todayHours.isOpen) {
      return false;
    }
    
    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  }

  // Get next available delivery slot
  getNextAvailableSlot(businessHours: BusinessHours[] = []): DeliveryDateOption | null {
    const availableDates = this.getAvailableDeliveryDates([], 7, businessHours);
    
    for (const dateOption of availableDates) {
      const availableSlots = dateOption.timeSlots.filter(slot => slot.isAvailable);
      if (availableSlots.length > 0) {
        return {
          ...dateOption,
          timeSlots: availableSlots,
        };
      }
    }
    
    return null;
  }

  // Parse API date string
  parseApiDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      return isValid(date) ? date : null;
    } catch (error) {
      return null;
    }
  }

  // Convert date to API format
  toApiFormat(date: Date): string {
    return this.formatDate(date, DATE_FORMATS.API_DATETIME);
  }

  // Get date range for analytics/reports
  getDateRange(period: 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom', customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
    const now = new Date();
    
    switch (period) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday),
        };
      case 'week':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case 'year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
        };
      case 'custom':
        return {
          start: customStart || startOfDay(now),
                    end: customEnd || endOfDay(now),
        };
      default:
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
    }
  }

  // Get days between two dates
  getDaysBetween(startDate: Date | string, endDate: Date | string): number {
    try {
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      if (!isValid(start) || !isValid(end)) {
        return 0;
      }
      
      return differenceInDays(end, start);
    } catch (error) {
      return 0;
    }
  }

  // Get hours between two dates
  getHoursBetween(startDate: Date | string, endDate: Date | string): number {
    try {
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      if (!isValid(start) || !isValid(end)) {
        return 0;
      }
      
      return differenceInHours(end, start);
    } catch (error) {
      return 0;
    }
  }

  // Get minutes between two dates
  getMinutesBetween(startDate: Date | string, endDate: Date | string): number {
    try {
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      if (!isValid(start) || !isValid(end)) {
        return 0;
      }
      
      return differenceInMinutes(end, start);
    } catch (error) {
      return 0;
    }
  }

  // Check if date is within a range
  isDateInRange(date: Date | string, startDate: Date | string, endDate: Date | string): boolean {
    try {
      const checkDate = parseDate(date);
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      if (!isValid(checkDate) || !isValid(start) || !isValid(end)) {
        return false;
      }
      
      return isDateWithinInterval(checkDate, start, end);
    } catch (error) {
      return false;
    }
  }

  // Get all dates in a range
  getDatesInRange(startDate: Date | string, endDate: Date | string): Date[] {
    try {
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      if (!isValid(start) || !isValid(end)) {
        return [];
      }
      
      return getDatesInDateRange(start, end);
    } catch (error) {
      return [];
    }
  }

  // Add time to date
  addTime(date: Date | string, amount: number, unit: 'days' | 'hours' | 'minutes' | 'weeks' | 'months'): Date {
    const dateObj = typeof date === 'string' ? parseDate(date) : date;
    
    if (!isValid(dateObj)) {
      return new Date();
    }
    
    switch (unit) {
      case 'days':
        return addDays(dateObj, amount);
      case 'hours':
        return addHours(dateObj, amount);
      case 'minutes':
        return addMinutes(dateObj, amount);
      case 'weeks':
        return addWeeks(dateObj, amount);
      case 'months':
        return addMonths(dateObj, amount);
      default:
        return dateObj;
    }
  }

  // Subtract time from date
  subtractTime(date: Date | string, amount: number, unit: 'days' | 'hours' | 'minutes'): Date {
    const dateObj = typeof date === 'string' ? parseDate(date) : date;
    
    if (!isValid(dateObj)) {
      return new Date();
    }
    
    switch (unit) {
      case 'days':
        return subDays(dateObj, amount);
      case 'hours':
        return subHours(dateObj, amount);
      case 'minutes':
        return subMinutes(dateObj, amount);
      default:
        return dateObj;
    }
  }

  // Get age from birthdate
  getAge(birthDate: Date | string): number {
    try {
      const birth = typeof birthDate === 'string' ? parseDate(birthDate) : birthDate;
      
      if (!isValid(birth)) {
        return 0;
      }
      
      return differenceInDays(new Date(), birth) / 365.25;
    } catch (error) {
      return 0;
    }
  }

  // Format duration in human readable format
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }

  // Get time until delivery
  getTimeUntilDelivery(deliveryTime: Date | string): string {
    try {
      const delivery = typeof deliveryTime === 'string' ? parseDate(deliveryTime) : deliveryTime;
      
      if (!isValid(delivery)) {
        return 'Invalid time';
      }
      
      const now = new Date();
      
      if (isBefore(delivery, now)) {
        return 'Delivery time passed';
      }
      
      const minutesUntil = differenceInMinutes(delivery, now);
      return this.formatDuration(minutesUntil);
    } catch (error) {
      return 'Invalid time';
    }
  }

  // Check if delivery is urgent (within next hour)
  isUrgentDelivery(deliveryTime: Date | string): boolean {
    try {
      const delivery = typeof deliveryTime === 'string' ? parseDate(deliveryTime) : deliveryTime;
      
      if (!isValid(delivery)) {
        return false;
      }
      
      const now = new Date();
      const oneHourFromNow = addHours(now, 1);
      
      return isAfter(delivery, now) && isBefore(delivery, oneHourFromNow);
    } catch (error) {
      return false;
    }
  }

  // Get delivery status based on time
  getDeliveryStatus(
    orderTime: Date | string,
    deliveryTime: Date | string,
    currentStatus: string
  ): {
    status: string;
    message: string;
    isDelayed: boolean;
  } {
    try {
      const order = typeof orderTime === 'string' ? parseDate(orderTime) : orderTime;
      const delivery = typeof deliveryTime === 'string' ? parseDate(deliveryTime) : deliveryTime;
      const now = new Date();
      
      if (!isValid(order) || !isValid(delivery)) {
        return {
          status: currentStatus,
          message: 'Invalid delivery time',
          isDelayed: false,
        };
      }
      
      const isDelayed = isAfter(now, delivery) && currentStatus !== 'delivered';
      
      if (currentStatus === 'delivered') {
        return {
          status: 'delivered',
          message: `Delivered ${this.getRelativeTime(delivery)}`,
          isDelayed: false,
        };
      }
      
      if (isDelayed) {
        return {
          status: 'delayed',
          message: `Delivery was expected ${this.getRelativeTime(delivery)}`,
          isDelayed: true,
        };
      }
      
      if (this.isUrgentDelivery(delivery)) {
        return {
          status: 'urgent',
          message: `Delivery in ${this.getTimeUntilDelivery(delivery)}`,
          isDelayed: false,
        };
      }
      
      return {
        status: currentStatus,
        message: `Expected delivery ${this.getRelativeTime(delivery)}`,
        isDelayed: false,
      };
    } catch (error) {
      return {
        status: currentStatus,
        message: 'Unable to determine delivery status',
        isDelayed: false,
      };
    }
  }

  // Validate date string
  isValidDateString(dateString: string): boolean {
    try {
      const date = parseDate(dateString);
      return isValid(date);
    } catch (error) {
      return false;
    }
  }

  // Get timezone offset
  getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
  }

  // Convert UTC to local time
  utcToLocal(utcDate: Date | string): Date {
    const date = typeof utcDate === 'string' ? parseDate(utcDate) : utcDate;
    return new Date(date.getTime() - (this.getTimezoneOffset() * 60000));
  }

  // Convert local time to UTC
  localToUtc(localDate: Date | string): Date {
    const date = typeof localDate === 'string' ? parseDate(localDate) : localDate;
    return new Date(date.getTime() + (this.getTimezoneOffset() * 60000));
  }

  // Get week number
  getWeekNumber(date: Date | string): number {
    const dateObj = typeof date === 'string' ? parseDate(date) : date;
    const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
    const pastDaysOfYear = differenceInDays(dateObj, firstDayOfYear);
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Get month name
  getMonthName(date: Date | string, short: boolean = false): string {
    const formatString = short ? 'MMM' : 'MMMM';
    return this.formatDate(date, formatString);
  }

  // Get day name
  getDayName(date: Date | string, short: boolean = false): string {
    const formatString = short ? 'EEE' : 'EEEE';
    return this.formatDate(date, formatString);
  }

  // Get quarter
  getQuarter(date: Date | string): number {
    const dateObj = typeof date === 'string' ? parseDate(date) : date;
    return Math.ceil((dateObj.getMonth() + 1) / 3);
  }

  // Check if date is weekend
  isWeekend(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseDate(date) : date;
    const day = getDay(dateObj);
    return day === 0 || day === 6; // Sunday or Saturday
  }

  // Get business days between dates (excluding weekends)
  getBusinessDaysBetween(startDate: Date | string, endDate: Date | string): number {
    const dates = this.getDatesInRange(startDate, endDate);
    return dates.filter(date => !this.isWeekend(date)).length;
  }
}

// Export singleton instance
export const dateUtils = new DateUtils();

// Export convenience functions
export const formatDate = (date: Date | string, format?: string) => dateUtils.formatDate(date, format);
export const formatTime = (date: Date | string, format?: string) => dateUtils.formatTime(date, format);
export const formatDateTime = (date: Date | string, format?: string) => dateUtils.formatDateTime(date, format);
export const getRelativeTime = (date: Date | string) => dateUtils.getRelativeTime(date);
export const isDateToday = (date: Date | string) => dateUtils.isDateToday(date);
export const isDateTomorrow = (date: Date | string) => dateUtils.isDateTomorrow(date);
export const getDateDisplayLabel = (date: Date | string) => dateUtils.getDateDisplayLabel(date);
export const getAvailableDeliveryDates = (excludeDates?: Date[], maxDays?: number, businessHours?: BusinessHours[]) => 
  dateUtils.getAvailableDeliveryDates(excludeDates, maxDays, businessHours);
export const getOrderStatusTime = (orderDate: Date | string, status: string) => 
  dateUtils.getOrderStatusTime(orderDate, status);
export const getEstimatedDeliveryTime = (orderTime: Date | string, prepMinutes?: number, deliveryMinutes?: number) => 
  dateUtils.getEstimatedDeliveryTime(orderTime, prepMinutes, deliveryMinutes);
export const isValidDeliveryTime = (date: Date | string, timeSlot: string) => 
  dateUtils.isValidDeliveryTime(date, timeSlot);
export const getTimeUntilDelivery = (deliveryTime: Date | string) => dateUtils.getTimeUntilDelivery(deliveryTime);
export const isUrgentDelivery = (deliveryTime: Date | string) => dateUtils.isUrgentDelivery(deliveryTime);
export const getDeliveryStatus = (orderTime: Date | string, deliveryTime: Date | string, currentStatus: string) => 
  dateUtils.getDeliveryStatus(orderTime, deliveryTime, currentStatus);

// Default export
export default dateUtils;


