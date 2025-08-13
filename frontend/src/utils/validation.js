// src/utils/validation.js

/**
 * Validates if an email address has a correct format.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Validates password strength based on minimum length.
 * @param {string} password - The password to validate.
 * @param {number} [minLength=8] - The minimum required length.
 * @returns {boolean} - True if the password meets the criteria.
 */
export const isValidPassword = (password, minLength = 8) => {
  return password && password.length >= minLength;
};

/**
 * Checks if a value is a positive number.
 * @param {*} value - The value to check.
 * @returns {boolean} - True if the value is a positive number.
 */
export const isPositiveNumber = (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
};

/**
 * Checks if a required field is empty.
 * @param {*} value - The value to check.
 * @returns {boolean} - True if the value is not empty.
 */
export const isNotEmpty = (value) => {
    return value !== null && value !== undefined && String(value).trim() !== '';
};