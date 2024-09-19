const mongoose = require("mongoose");
const validator = require("validator");

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
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationTokenExpires: {
    type: Date,
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

const User = mongoose.model("User", userSchema);
module.exports = User;
