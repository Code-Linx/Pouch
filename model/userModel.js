const crypto = require('crypto'); // Needed for generating tokens
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Input Your First Name'],
  },
  lastName: {
    type: String,
    required: [true, 'Input Your Last Name'],
  },
  email: {
    type: String,
    required: [true, 'Please Input Your Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide a valid Email'],
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
    enum: ['user', 'admin'],
    default: 'user', // Role defaults to 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // Excludes password from query results by default
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm Password'],
    validate: {
      // This only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date, // Track when the password was changed
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  accountDeletionRequestDate: {
    type: Date,
    default: null, // Default to null if no deletion request has been made
  },
  DOB: {
    type: Date, // Use Mongoose's built-in Date type
    required: [true, 'Enter Your Date of Birth'],
  },
  kyc: {
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    documents: [
      {
        url: { type: String, required: true }, // Cloudinary URL for the document
        documentType: { type: String, required: true }, // Type of document (e.g., ID, address proof)
        uploadedAt: { type: Date, default: Date.now }, // When the document was uploaded
      },
    ],
  },
  currency: {
    type: String,
    required: true, // Ensure each user has a currency set
    default: 'USD', // You can set a default currency if needed
  },
});

userSchema.pre('save', async function (next) {
  // 1. Hash the password before saving
  // Only run this function if the password was actually modified
  if (!this.isModified('password')) return next();

  // console.log('Password before hashing:', this.password); // Debug line
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// 2. Set the passwordChangedAt field
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

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
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex'); // Encrypt the token and store it in DB

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours

  return verificationToken; // Return plain token to send in the email
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
