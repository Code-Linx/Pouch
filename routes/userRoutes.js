const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../middleware/authController');
const verifyEmailController = require('../middleware/verifyemail');
const budgetController = require('../controllers/budgetController');
const dashboardController = require('../controllers/dashboardController');
const categoryController = require('../controllers/categoryController');
const transController = require('../controllers/TransController');
const stripeController = require('../controllers/premiumController');

const router = express.Router();

router.post('/register', authController.signUp); // Fix this line
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/verifyEmail/:token', verifyEmailController.verifyEmail);

router.post('/forgetPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//PROTECTED ROUTES

router.patch(
  '/updateMypassword',
  authController.protect,
  authController.updatePassword
);

router.get(
  '/getAllBudget',
  authController.protect,
  budgetController.getAllMyBudget
);

router.get(
  '/dashboard',
  authController.protect,
  dashboardController.getDashboard
);

router.post(
  '/addbudgets',
  authController.protect,
  budgetController.createBudget
);

router.post(
  '/addCategory',
  authController.protect,
  categoryController.createCategory
); // Create category

// Route for users to upload KYC documents
router.post(
  '/kyc/upload',
  authController.protect,
  /* upload.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
  ]), */
  userController.uploadKYC
);

router.get('/me', authController.protect, userController.getMe);

router.patch(
  '/deactivateMyAcc',
  authController.protect,
  userController.deleteMe
);

router.patch(
  '/updateUser',
  authController.protect,
  userController.updateUserData
);

router.patch(
  '/editBudget/:id',
  authController.protect,
  authController.restrictTo('user'),
  budgetController.updateBudget
);

router.delete(
  '/removeBudget/:id',
  authController.protect,
  authController.restrictTo('user'),
  budgetController.deleteBudget
);

router.delete(
  '/deleteTrx/:id',
  authController.protect,
  authController.restrictTo('user'),
  transController.deleteTrans
);

router.patch(
  '/updateTrx/:id',
  authController.protect,
  authController.restrictTo('user'),
  transController.updateTrans
);

router.get(
  '/create-checkout-session',
  authController.protect,
  stripeController.createCheckoutSession
);

module.exports = router;
