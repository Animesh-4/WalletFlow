// backend/src/utils/validators.js

/**
 * Checks if a given value is a valid UUID.
 * @param {string} uuid - The string to validate.
 * @returns {boolean} True if the string is a valid UUID, false otherwise.
 */
const isUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates that a value is a positive number.
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is a positive number.
 */
const isPositiveNumber = (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
};


module.exports = {
  isUUID,
  isPositiveNumber,
};
