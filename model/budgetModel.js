const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  monthlyBudget: {
    type: Number,
    required: [true, 'Monthly budget is required'],
  },
  monthlyIncome: {
    type: Number,
    default: 0,
  },
  monthlyExpenses: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'USD', // Default currency can be set here
  },
});

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;
