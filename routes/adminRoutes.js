const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../middleware/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.get(
  '/transaction-summary',
  authController.protect, // Middleware to protect the route
  authController.restrictTo('admin'), // Middleware to restrict to admin
  adminController.getAdminTransactionSummary
);

router.get('/me', authController.protect, userController.getMe);

router.get(
  '/:userId/transaction-summary',
  authController.protect, // Protect the route
  authController.restrictTo('admin'), // Restrict to admin
  adminController.getUserTransactionSummary
);

router.get(
  '/userData/:userId',
  authController.protect,
  authController.restrictTo('admin'),
  adminController.getUserProfile
);

module.exports = router;
