// backend/src/routes/notification.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticateToken = require('../middleware/auth');

// Apply authentication middleware to all notification routes
router.use(authenticateToken);

// @route   GET api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/', notificationController.getNotifications);

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', notificationController.markAllAsRead);


module.exports = router;
