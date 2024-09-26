const User = require('../model/userModel');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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

// Upload KYC document controller
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
