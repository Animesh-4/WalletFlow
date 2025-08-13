// backend/src/controllers/userController.js
const userService = require('../services/userService');

exports.updateUser = async (req, res) => {
  try {
    // Users can only update their own profile
    if (req.user.id !== parseInt(req.params.id, 10)) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};