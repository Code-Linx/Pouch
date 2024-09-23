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
