export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a date string or Date object into a more readable format.
 * @param {string | Date} date - The date to format.
 * @returns {string} - The formatted date string.
 * @example
 * // returns "March 15, 2024"
 * formatDate('2024-03-15T10:00:00.000Z');
 */
export const formatDate = (date) => {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date string or Date object into a short format.
 * @param {string | Date} date - The date to format.
 * @returns {string} - The formatted date string (e.g., MM/DD/YYYY).
 * @example
 * // returns "03/15/2024"
 * formatShortDate('2024-03-15T10:00:00.000Z');
 */
export const formatShortDate = (date) => {
    if (!date) return '';
    try {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date(date));
    } catch (error) {
        console.error("Error formatting short date:", error);
        return 'Invalid Date';
    }
};
