const User = require('../model/userModel');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Email } = require('../util/email');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kyc-docs',
    allowed_formats: ['jpg', 'png', 'pdf'],
  },
});

const upload = multer({ storage });

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

exports.deleteMe = async (req, res) => {
  try {
    // Find the user and mark them as inactive
    const user = await User.findByIdAndUpdate(req.user.id, {
      active: false,
      accountDeletionRequestDate: Date.now(), // Store the deletion request date
    });
    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'User not found',
      });
    }
    // Send an email to notify the user about the deletion process and 30-day grace period
    const deletionInfoUrl = `${req.protocol}://${req.get(
      'host'
    )}/deletion-details`; // Example URL
    const DeletionMail = new Email(user, deletionInfoUrl);
    await DeletionMail.sendAccountDeletionNotice(); // Send account deletion notice email

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Upload KYC document controller
exports.uploadKYC = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Fetch current logged-in user
    if (!user) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'User not found' });
    }

    // Use multer to handle the file upload
    upload.fields([
      { name: 'idCard', maxCount: 1 },
      { name: 'proofOfAddress', maxCount: 1 },
    ])(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ status: 'fail', message: err.message });
      }

      // Check if both files were uploaded
      if (!req.files || !req.files.idCard || !req.files.proofOfAddress) {
        return res.status(400).json({
          status: 'error',
          message: 'Please upload both ID card and proof of address documents.',
        });
      }

      // Store KYC documents' Cloudinary URLs
      if (req.files.idCard) {
        user.kyc.documents.push({
          url: req.files.idCard[0].path, // Cloudinary stores the file path as URL
          documentType: 'ID CARD',
        });
      }

      if (req.files.proofOfAddress) {
        user.kyc.documents.push({
          url: req.files.proofOfAddress[0].path,
          documentType: 'Proof of Address',
        });
      }

      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: 'success',
        message: 'KYC documents uploaded successfully!',
        data: user.kyc,
      });
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.updateUserData = async (req, res) => {
  const { email, userName } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { email, userName },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }

  res.status(201).json({
    status: 'success',
    message: "You've successfully update your account",
    data: {
      user,
    },
  });
};

exports.updateMyPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
  } catch (error) {}
};
