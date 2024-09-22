const crypto = require("crypto");
const { Email } = require("../util/email");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { AppError } = require("../util/appError");
const {} = require("../util/catchAsync");

// Helper function to sign a JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper function to send the token and response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.verifyEmail = async (req, res, next) => {
  // 1. Get the token from the URL and hash it
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // 2. Find the user by the hashed token and check if the token is not expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired.", 400));
  }

  // 3. Verify the user’s email and clear the token
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Send success email
  await new Email(user, null).sendVerificationSuccess();

  // 4. Send success message and log the user in
  createSendToken(user, 200, res);
};
