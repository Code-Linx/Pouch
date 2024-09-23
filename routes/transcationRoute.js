const express = require('express');
const authController = require('../middleware/authController');
const transController = require('../controllers/TransController');

const router = express.Router();

router.post(
  '/createTrx',
  authController.protect,
  transController.createTransaction
);

router.get(
  '/getAllTrx',
  authController.protect,
  transController.getAllTransactions
);

router.get(
  '/summary',
  authController.protect,
  transController.getTransactionSummary
);

router.get(
  '/:transactionId',
  authController.protect,
  transController.getTransactionById
);

module.exports = router;
