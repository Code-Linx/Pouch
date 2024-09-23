const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
  },
  description: {
    type: String,
    required: [true, 'Transaction description is required'],
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  currency: {
    type: String,
    default: 'USD', // Default currency can be set here
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
