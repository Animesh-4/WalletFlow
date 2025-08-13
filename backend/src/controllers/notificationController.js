// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findByUserId(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await Notification.markAsRead(id, req.user.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or access denied.' });
        }
        res.status(200).json(notification);
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.markAllAsRead(req.user.id);
        res.status(200).json({ message: 'All notifications marked as read.' });
    } catch (error) {
        next(error);
    }
};
