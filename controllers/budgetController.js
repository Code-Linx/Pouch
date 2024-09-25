const Budget = require('../model/budgetModel');
const Category = require('../model/categoryModel');

exports.createBudget = async (req, res) => {
  try {
    const categoryName = req.body.category; // Expecting category name

    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Category not found' });
    }

    const budget = await Budget.create({
      userId: req.user.id,
      category: category._id, // Use the found ObjectId
      monthlyBudget: req.body.monthlyBudget,
      monthlyIncome: req.body.monthlyIncome || 0,
      monthlyExpenses: req.body.monthlyExpenses || 0,
      currency: req.body.currency || 'USD',
    });

    res.status(201).json({
      status: 'success',
      data: {
        budget,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getAllMyBudget = async (req, res, next) => {
  try {
    const budget = await Budget.find({ userId: req.user._id });
    if (!budget) {
      return res.status(200).json({
        status: 'success',
        message: 'You do not have a budget Yet, Please create One',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        budget,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const { monthlyBudget, monthlyIncome, monthlyExpenses } = req.body.id;
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      {
        monthlyBudget,
        monthlyIncome,
        monthlyExpenses,
      },
      {
        new: true,
      }
    );

    if (!budget) {
      return res.status(400).json({
        status: 'Failed',
        message: 'No budget with that Id',
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        budget,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Budget not found' });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
