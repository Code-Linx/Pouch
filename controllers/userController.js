const User = require('../model/userModel');

exports.getMe = async (req, res, next) => {
  try {
    // Fetch the current user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Respond with user profile data
    res.status(200).json({
      status: 'success',
      data: {
        user, // User profile information
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
