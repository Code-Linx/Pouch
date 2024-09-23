const Category = require('../model/categoryModel');

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body; // Expecting { "name": "Groceries" }

    const category = await Category.create({ name });

    res.status(201).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
