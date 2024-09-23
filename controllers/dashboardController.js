const Transaction = require('../model/transactionModel');
const Budget = require('../model/budgetModel');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch user's transactions
    const transactions = await Transaction.find({ userId }); // Use an object to filter by userId

    // Fetch user's budget
    const budget = await Budget.findOne({ userId }); // Use findOne to get a single budget

    // Calculate total income
    const totalIncome = transactions
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);

    // Calculate total expenses
    const totalExpenses = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);

    // Calculate remaining budget
    const remainingBudget = budget
      ? budget.monthlyBudget - totalExpenses
      : 'Please Create a budget';

    res.status(200).json({
      status: 'success',
      data: {
        budget: budget || 'Please Create A Budget', // Return a message if no budget exists
        transactions,
        summary: {
          totalIncome,
          totalExpenses,
          remainingBudget,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
