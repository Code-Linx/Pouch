const Email = require("../util/email"); // Ensure your Email utility is required
const User = require("../model/userModel"); // Adjust the path as necessary

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;

    // Find the user by the token and verify it
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user || user.isVerified) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid or expired token.",
      });
    }

    // Verify the email and remove the token
    user.isVerified = true;
    user.emailVerificationToken = undefined; // Optionally remove the token
    await user.save();

    // Send a success email
    const url = `${req.protocol}://${req.get("host")}/login`; // Adjust this as needed
    await new Email(user, url).sendSuccess(); // Assuming you have a sendSuccess method

    res.status(200).json({
      status: "success",
      message: "Email verified successfully!",
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};
