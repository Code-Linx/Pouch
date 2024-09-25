const Category = require('../model/categoryModel');

exports.createCategory = async (req, res, next) => {
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

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params.id;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        status: 'Failed',
        message: 'No doc with that id',
      });
    }

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getAllcategory = async (req, res, next) => {
  try {
    const category = await Category.find();
    res.status(200).json({
      status: 'Success',
      data: category,
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.editCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id);
    if (!category) {
      res.status(404).json({
        status: 'Failed',
        message: 'No category with that ID',
      });
    }
    res.status(201).json({
      status: 'Success',
      data: category,
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
