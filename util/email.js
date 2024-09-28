const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

class Email {
  constructor(user, url, loginDetails) {
    // Accept loginDetails here
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `Pouch <${process.env.EMAIL_FROM}>`;
    this.loginDetails = loginDetails; // Store login details
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({});
    }

    return nodemailer.createTransport({
      host: process.env.BREVO_HOST,
      port: process.env.BREVO_PORT,
      auth: {
        user: process.env.BREVO_USERNAME,
        pass: process.env.BREVO_PASSWORD,
      },
      secure: true,
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
      loginDetails: this.loginDetails, // Pass loginDetails to the template
    });

    // 2) Define Email Options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Pouch Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  async sendEmailVerification() {
    await this.send('emailVerification', 'Verify your email address');
  }

  async sendVerificationSuccess() {
    await this.send('verificationSuccess', 'Email Verification Successful!');
  }

  async sendAccountDeletionNotice() {
    await this.send(
      'accountDeletionNotice',
      'Your account will be permanently deleted in 30 days'
    );
  }
  async sendLoginNotification() {
    const subject = 'Login Notification';
    const template = 'loginNotification';
    await this.send(template, subject);
  }
}

module.exports = { Email };
