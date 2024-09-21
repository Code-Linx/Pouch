const User = require("../model/userModel");
const axios = require("axios");
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const geoip = require("geoip-lite"); // Library for geolocation
const uaParser = require("ua-parser-js"); // Library for parsing user agent (device info)
const { Email } = require("../util/email");

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

exports.signUp = async (req, res, next) => {
  try {
    // Create new user without saving it yet
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      userName: req.body.userName,
      DOB: req.body.DOB,
    });

    // 1. Send Welcome Email
    const url = `${req.protocol}://${req.get("host")}/me`;
    await new Email(newUser, url).sendWelcome();

    // 2. Generate Email Verification Token
    const emailToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    // 3. Send Verification Email
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/verifyEmail/${emailToken}`;
    await new Email(newUser, verificationUrl).sendEmailVerification();

    res.status(200).json({
      status: "success",
      message:
        "Signup successful! Please check your email to verify your account.",
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
    console.error(err.message);
  }
  next();
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
    return res.status(400).json({
      status: "Failed",
      message: "Token is invalid or has expired.",
    });
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

exports.login = async (req, res, next) => {
  try {
    //1. Check if email and password is specified
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        status: "Failed",
        message: "Please Provide Email and Password!",
      });
    }

    //2. Check if user exist
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid credentials",
      });
    }

    //3. Check if user email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        status: "Failed",
        message: "Please verify Your Email before your login",
      });
    }

    // 3. Extract device and location info
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const response = await axios.get(`https://ipinfo.io/${ip}/json`);
    const location = response.data.city
      ? `${response.data.city}, ${response.data.region}`
      : "Location unavailable";

    const loginDetails = {
      when: new Date().toUTCString(),
      device: req.headers["user-agent"],
      ip,
      location,
    };

    // 4. Send login info email to user
    const loginInfoUrl = `${req.protocol}://${req.get("host")}/login-details`; // Example URL for login details
    const Loginmail = new Email(user, loginInfoUrl, loginDetails); // Pass loginDetails
    await Loginmail.sendLoginNotification(); // Send the login notification

    //5 Generate JWT token
    createSendToken(user, 200, res);
  } catch (err) {
    // 6. Catch any errors and return a 500 status
    console.error("Error during login: ", err); // Log the error for debugging
    return res.status(500).json({
      status: "Failed",
      message: "An error occurred during login",
    });
  }
};
