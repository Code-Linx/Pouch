const crypto = require("crypto"); // Needed for generating tokens
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Input Your First Name"],
  },
  lastName: {
    type: String,
    required: [true, "Input Your Last Name"],
  },
  email: {
    type: String,
    required: [true, "Please Input Your Email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please Provide a valid Email"],
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String, // Stores the token sent to the user for email verification
  },
  emailVerificationExpires: {
    type: Date, // Token expiration time (e.g., valid for 24 hours)
  },
  userName: {
    type: String,
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user", // Role defaults to 'user'
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false, // Excludes password from query results by default
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please Confirm Password"],
    validate: {
      // This only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date, // Track when the password was changed
  DOB: {
    type: Date, // Use Mongoose's built-in Date type
    required: [true, "Enter Your Date of Birth"],
  },
  kyc: {
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    documents: { type: [String] }, // Paths to uploaded KYC documents
  },
  expenses: [
    {
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now },
    },
  ],
  income: [
    {
      amount: Number,
      source: String,
      date: { type: Date, default: Date.now },
    },
  ],
  budget: {
    monthlyIncome: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
  },
});

// Middleware to hash password before saving user
// 1. Hash the password before saving
userSchema.pre("save", async function (next) {
  // Only run this function if the password was actually modified
  if (!this.isModified("password")) return next();

  console.log("Password before hashing:", this.password); // Debug line
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// 2. Set the passwordChangedAt field
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // Set passwordChangedAt to one second in the past to account for token creation delay
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// 3. Compare candidate password with the stored password

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to generate the email verification token
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex"); // Encrypt the token and store it in DB

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours

  return verificationToken; // Return plain token to send in the email
};

const User = mongoose.model("User", userSchema);
module.exports = User;
