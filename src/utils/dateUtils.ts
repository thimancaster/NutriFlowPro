
/**
 * Format date to a readable string
 * @param dateString Any valid date string or Date object
 * @returns Formatted date string (e.g., "01 Jan 2025")
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Format date as "DD MMM YYYY"
  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  };
  
  return date.toLocaleDateString('pt-BR', options);
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param date Date object
 * @returns ISO formatted date string
 */
export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Check if a date is today
 * @param date Date to check
 * @returns Boolean indicating if the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
