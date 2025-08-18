// backend/src/controllers/userController.js
const userService = require('../services/userService');

exports.updateUser = async (req, res, next) => {
  try {
    // Users can only update their own profile
    if (req.user.id !== parseInt(req.params.id, 10)) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    // This now passes the error to your centralized error handler for a consistent response.
    next(error);
  }
};
