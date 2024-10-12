const User = require('../model/userModel');
const axios = require('axios');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite'); // Library for geolocation
const uaParser = require('ua-parser-js'); // Library for parsing user agent (device info)
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');
const { Email } = require('../util/email');
const securityLogger = require('../util/securityLogger');

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
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  //1 Check if user already exists
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return next(new AppError('user already exist', 400));
  }

  //2 Create new user without saving it yet
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    userName: req.body.userName,
    DOB: req.body.DOB,
  });

  // 3. Send Welcome Email
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  // 4. Generate Email Verification Token
  const emailToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // 5. Send Verification Email
  const verificationUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verifyEmail/${emailToken}`;
  await new Email(newUser, verificationUrl).sendEmailVerification();

  res.status(201).json({
    status: 'success',
    message:
      'Signup successful! Please check your email to verify your account.',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  console.log(req.headers.authorization); // Ensure it prints 'Bearer <token>'

  //1. Check if email and password are specified
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please Provide Email and Password!', 401));
  }

  //2. Check if user exists
  const user = await User.findOne({ email }).select(
    '+password +active +accountDeletionRequestDate'
  );
  if (!user || !(await user.correctPassword(password, user.password))) {
    securityLogger.warn(`Failed login attempt for email: ${email}`);
    return next(new AppError('Invalid credentials', 401));
  }

  //3. Check if user email is verified
  if (!user.isEmailVerified) {
    return next(
      new AppError('Please verify Your Email before your login', 401)
    );
  }

  //4. Check if the user is inactive and within the grace period
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (!user.active && user.accountDeletionRequestDate > thirtyDaysAgo) {
    // Re-activate the user account
    user.active = true; // Set user account back to active
    await user.save({ validateBeforeSave: false }); // Save the changes

    const reactivationUrl = `${req.protocol}://${req.get(
      'host'
    )}/reactivation-notice`; // Example URL
    const ReactivationMail = new Email(user, reactivationUrl);
    await ReactivationMail.sendAccountReactivationNotice(); // Send reactivation notice email
  }

  //5. Extract device and location info
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const response = await axios.get(`https://ipinfo.io/${ip}/json`);
  const location = response.data.city
    ? `${response.data.city}, ${response.data.region}`
    : 'Location unavailable';

  const loginDetails = {
    when: new Date().toUTCString(),
    device: req.headers['user-agent'],
    ip,
    location,
  };

  //6. Send login info email to user
  const loginInfoUrl = `${req.protocol}://${req.get('host')}/login-details`; // Example URL for login details
  const Loginmail = new Email(user, loginInfoUrl, loginDetails); // Pass loginDetails
  await Loginmail.sendLoginNotification(); // Send the login notification

  //7. Generate JWT token
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log('Decoded Token:', decoded);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.logout = (req, res) => {
  // Set the jwt cookie to 'loggedout' and make it expire quickly
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure in production
  });

  res.status(200).json({ status: 'success' });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    console.log('error:', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 2) If token has not expired, and there is user, set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin',]. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};
