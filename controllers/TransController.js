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
    // 1. Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]); // Remove non-filtering fields

    // Handle advanced filtering for ranges like { amount: { gte: 100, lte: 1000 } }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Transaction.find({
      userId: req.user._id,
      ...JSON.parse(queryStr),
    });

    // 2. Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sorting by createdAt (descending)
    }

    // 3. Field Limiting (Selecting specific fields)
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); // Exclude version field by default
    }

    // 4. Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTransactions = await Transaction.countDocuments({
        userId: req.user._id,
      });
      if (skip >= numTransactions) {
        return res
          .status(404)
          .json({ status: 'fail', message: 'Page does not exist' });
      }
    }

    // Execute query
    const transactions = await query;

    // Check if there are no transactions
    if (transactions.length === 0) {
      return res.status(200).json({
        status: 'Success',
        message: 'No transactions found. Please create a new transaction.',
      });
    }

    // Send the response
    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: {
        transactions,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get a specific transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
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

exports.deleteTrans = async (req, res, next) => {
  try {
    const trx = await Transaction.findByIdAndDelete(req.params.id);
    if (!trx) {
      return res.status(404).json({
        status: 'Failed',
        message: 'No transaction document with that id',
      });
    }

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateTrans = async (req, res, next) => {
  try {
    const { amount, description, currency, type } = req.body;
    const trx = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        amount: req.body.amount,
        type: req.body.type,
        description: req.body.description,
        currency: req.body.currency,
      },
      { new: true }
    );

    if (!trx) {
      return res.status(404).json({
        status: 'Failed',
        message: 'No transaction document with that id',
      });
    }

    res.status(201).json({
      status: 'Success',
      data: { trx },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
