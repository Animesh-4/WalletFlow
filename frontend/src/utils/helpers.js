// src/utils/helpers.js

/**
 * A simple utility to conditionally join class names together.
 * Useful for dynamic styling in React components.
 * @param {...(string|boolean|null|undefined)} classes - The classes to combine.
 * @returns {string} A string of space-separated class names.
 */
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Delays execution for a specified amount of time.
 * Useful for simulating network latency in development.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generates a placeholder image URL from a service like placehold.co.
 * @param {object} options - The options for the placeholder.
 * @param {number} [options.width=150] - The width of the image.
 * @param {number} [options.height=150] - The height of the image.
 * @param {string} [options.text] - The text to display on the image.
 * @param {string} [options.bgColor='E5E7EB'] - The background color hex code.
 * @param {string} [options.textColor='4B5563'] - The text color hex code.
 * @returns {string} The full placeholder image URL.
 */
export const getPlaceholderImage = ({ width = 150, height = 150, text = 'No Image', bgColor = 'E5E7EB', textColor = '4B5563' }) => {
    return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};