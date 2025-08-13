// backend/src/utils/helpers.js

/**
 * A utility function to remove sensitive properties from an object before sending it in a response.
 * @param {object} obj - The object to sanitize.
 * @param {Array<string>} keysToRemove - An array of keys to remove from the object.
 * @returns {object} A new object with the specified keys removed.
 */
const sanitizeObject = (obj, keysToRemove = ['password_hash']) => {
  const newObj = { ...obj };
  for (const key of keysToRemove) {
    delete newObj[key];
  }
  return newObj;
};

module.exports = {
  sanitizeObject,
};
