/**
 * Format a number to display with appropriate units
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  return value.toFixed(decimals);
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
};

/**
 * Format date for display
 */
export const formatDate = (date: Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'short':
      options.month = 'short';
      options.day = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'long':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Format battery percentage with color coding
 */
export const getBatteryColor = (percentage: number): string => {
  if (percentage >= 80) return '#4CAF50'; // Green
  if (percentage >= 50) return '#FF9800'; // Orange
  if (percentage >= 20) return '#F44336'; // Red
  return '#F44336'; // Red for critical
};

/**
 * Format distance values
 */
export const formatDistance = (km: number): string => {
  if (km >= 1000) {
    return `${(km / 1000).toFixed(1)}k km`;
  }
  return `${km.toFixed(0)} km`;
};

/**
 * Format speed values
 */
export const formatSpeed = (kmh: number): string => {
  return `${kmh.toFixed(0)} km/h`;
};

/**
 * Format temperature values
 */
export const formatTemperature = (celsius: number): string => {
  return `${celsius.toFixed(1)}°C`;
};

/**
 * Format power values
 */
export const formatPower = (kw: number): string => {
  return `${kw.toFixed(1)} kW`;
};

/**
 * Format efficiency values
 */
export const formatEfficiency = (kwhPer100km: number): string => {
  return `${kwhPer100km.toFixed(1)} kWh/100km`;
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Convert hex color to rgba
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
};

/**
 * Sleep function for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
