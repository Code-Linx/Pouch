# Pouch: Personal Budget Tracker Backend Api

![POUCH API](https://img.shields.io/badge/Node.js-Express.js-brightgreen)

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Project Overview

Pouch is a personal budget tracking app designed to help users manage their finances efficiently. It allows users to track income, expenses, and view detailed transaction history. The app features user authentication, email verification, and a premium subscription option for accessing advanced features. Built with Node.js, Express, and MongoDB, Pouch also incorporates security best practices, such as input sanitization and rate limiting, to protect user data.

## Features

- **User Authentication**: Secure sign-up, login, password reset, and email verification for user accounts.
- **User Profiles and Account Management**: Manage user details such as name, email, and view transaction history.
- **Transaction Management**: Add, edit, and view income and expense transactions with categorization.
- **Premium Subscription**: Access advanced features like analytics and reporting with a premium membership, integrated via Stripe for seamless payments.
- **Admin Dashboard**: Monitor users, transactions, and generate reports for administrative control.
- **Security**: Implements JWT authentication, data sanitization, rate limiting, prevention of cross-site scripting (XSS), protection against SQL injection, and secure HTTP headers.
- **Notifications**: Email notifications for important actions like successful sign-up, login, and transaction updates.
- **Error Handling**: Comprehensive error management with clear messages for both development and production environments.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer, Mailtrap, Brevo
- **Admin Dashboard**: MongoDB Aggregate pipeline

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v14 or higher)
- MongoDB
- Postman (for API testing)

## Getting Started

To get a local copy up and running, follow these simple steps:

1. **Clone the repo:**

   ```bash
   git clone https://github.com/Code-Linx/Pouch.git
   cd your-repo-name

   ```

2. **Navigate to the project directory**

   ```bash
   cd Pouch

   ```

3. **Install dependencies**

````bash
npm install

4. **Create a .env file in the root directory and add the following environment variables**
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=your-mongodb-connection-string
DATABASE_PASSWORD=your-mongodb-password
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=jwt-expire-time
JWT_COOKIE_EXPIRES_IN=jwt-cookie-expire-time
EMAIL_FROM=your-email-sending-from
EMAIL_USERNAME=email-service-username
EMAIL_PASSWORD=email-password
EMAIL_HOST=email-host
EMAIL_PORT=email-port
BREVO_HOST=host
BREVO_PORT=port
BREVO_USERNAME=username
BREVO_PASSWORD=password
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=api-key
CLOUDINARY_API_SECRET=api-secret-key

CRON_SCHEDULE_DEV=
CRON_SCHEDULE_PROD=

5. **Install dependencies**
```bash
npm start
````

## Folder Structure

```
├── controllers
├── middlewares
├── model
├── public
├── routes
├── util
├── views
├── .env
├── .gitignore
├── .prettierrc
├── app.js
├── package.json
└── server.js
```

## API Endpoints

### User Authentication

```
- POST /api/v1/users/register - Register a new user
- POST /api/v1/users/verifyEmail/:token - Verify Email
- POST /api/v1/users/login - Log in a user
- POST /api/v1/users/forgetPassword - Send password reset link
- PATCH /api/v1/users/resetPassword/:token - Reset user password
- PATCH /api/v1/users//updateMypassword - Update user password
```

### User Management

```
- GET /api/v1/users/me - Get user profile
- GET /api/v1/users/dashboard - User Dashboard
- PATCH /api/v1/users/updateUser - Update user profile but not password
- DELETE /api/v1/users/deactivateMyAcc - Delete user account
- POST /api/v1/users/kyc/upload - Upload kyc Docs
```

### Budgets

```

- POST /api/v1/users/addbudgets - Create a budget
- POST /api/v1/users/addCategory - Create a budget category
- GET /api/v1/users/getAllBudget - Get all Budgets
- DELETE /api/v1/users/removeBudget/:id - Delete Budget

```

### Transactions

```

- GET /api/v1/trans/:transId - Get Transcation
- GET /api/v1/trans/getAllTrx - Get all Transcation
- GET /api/v1/trans/summary - Get Transcation summary
- POST /api/v1/trans/createTrx - Create Transcation
- DELETE /api/v1/users/deleteTrx/:transId - Delete Transcation
- PATCH /api/v1/users/updatetrx/:transId - Update Transcation Entry
```

### Admin Endpoints

```

- GET /api/v1/admin/getAllUser - Get all users
- GET /api/v1/admin/:id/transaction-summary - Get User summary
- GET /api/v1/admin/transaction-summary - Get all Transcations summary
- GET /api/v1/admin/viewAllCategory - Get all categories
- GET /api/v1/admin/getAllBudget - Get all user Budget
- GET /api/v1/admin/me - Admin profile
- GET /api/v1/admin/userData/:id - Get user data
- PATCH /api/v1/admin//kyc/verify/:id - Verify user kyc
- PATCH /api/v1/admin/updateDoc/:id - Update user
- DELETE /api/v1/admin/deleteAcc/:id - Delete User

```

## Security

This application follows industry standards for securing user data and transactions. Below are the key security measures implemented:

- Encryption
  All sensitive user data, such as passwords, are encrypted using bcrypt before being stored in the database. Other sensitive information is encrypted using the crypto module.

- Data Sanitization, Secure HTTP headers, Parameter Pollution and several other security techniques against attacks like brute force, XSS, DoS and so on.

## Testing

All routes are tested using postman API tester.

## Contributing

```

Contributions are welcome! If you want to contribute to this project, please follow these steps:

Fork the project
Create a feature branch (git checkout -b feature/newFeature)
Commit your changes (git commit -m 'Add some newFeature')
Push to the branch (git push origin feature/newFeature)
Open a Pull Request
Code of Conduct
Please adhere to the code of conduct to maintain a collaborative and friendly environment.
```

## License

This project is licensed under the MIT License. See the LICENSE file for more information.

## Contact

```
Project Maintainer - Dennis Enoakpo
Email - codetitan2206@gmail.com
```
