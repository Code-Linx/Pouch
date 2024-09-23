const Transaction = require('../model/transactionModel');
const User = require('../model/userModel');

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({
      userId: req.user.id,
      amount: req.body.amount,
      type: req.body.type, // 'income' or 'expense'
      description: req.body.description,
      date: req.body.date || Date.now(), // Optional: defaults to now
    });

    res.status(201).json({
      status: 'success',
      data: {
        transaction,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get all transactions for the current user
exports.getAllTransactions = async (req, res) => {
  console.log('User ID:', req.user._id); // Debugging line
  try {
    // Fetch all transactions for the logged-in user
    const transactions = await Transaction.find({ userId: req.user._id });
    if (transactions.length === 0) {
      return res.status(200).json({
        status: 'Success',
        message: 'No transactions found. Please create a new transaction.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    // Get a specific transaction by ID
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({
        status: 'Fail',
        message: 'Transaction not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the start of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Aggregation pipeline for monthly summary
    const monthlySummary = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    // Get total expenses for the current month
    const totalExpensesMonth =
      monthlySummary.length > 0 ? monthlySummary[0].totalExpenses : 0;

    // Get total income for the year
    const totalIncomeYear = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: new Date(currentYear, 0, 1), // Start of the current year
            $lt: new Date(currentYear + 1, 0, 1), // Start of the next year
          },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        monthlySummary: {
          totalTransactions:
            monthlySummary.length > 0 ? monthlySummary[0].totalTransactions : 0,
          totalIncome:
            monthlySummary.length > 0 ? monthlySummary[0].totalIncome : 0,
          totalExpenses: totalExpensesMonth,
        },
        totalIncomeYear:
          totalIncomeYear.length > 0 ? totalIncomeYear[0].totalIncome : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
