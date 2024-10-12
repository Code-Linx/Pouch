const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const User = require('./model/userModel');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const logger = require('./util/logger');
// Initialize Datadog APM
const tracer = require('dd-trace').init({
  analytics: true, // Enable analytics
  service: 'pouch-backend', // Your service name
  env: process.env.NODE_ENV || 'development', // Environment (production/development)
});

const morgan = require('morgan');

//WEBPACK CONFIG
const { createProxyMiddleware } = require('http-proxy-middleware'); // Require the proxy middleware
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const { AppError } = require('./util/appError');
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const transRoueter = require('./routes/transcationRoute');
const viewRouter = require('./routes/viewRoutes');
const globalErrorHandler = require('./controllers/ErrorController');

// START APP
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Wiston Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).send('Server Error');
});

//DEVELOPMENT LOGGING
if ((process.env.NODE_ENV = 'development')) {
  app.use(morgan('dev'));
}

app.use(xss());

app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use(mongoSanitize());
app.use('/api', limiter);
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

const compiler = webpack(webpackConfig);

// Use Webpack Dev Middleware
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: { colors: true },
  })
);

//You can use webpack-dev-middleware with an output file by setting the writeToDisk option:
//This will write the compiled output to a file in the specified output directory.

// app.use(
//   webpackDevMiddleware(compiler, {
//     publicPath: webpackConfig.output.publicPath,
//     stats: { colors: true },
//     writeToDisk: true, // Add this option
//   })
// );

// Use Webpack Hot Middleware
app.use(webpackHotMiddleware(compiler));

//BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Determine the cron schedule based on the environment
const cronSchedule =
  process.env.NODE_ENV === 'production'
    ? process.env.CRON_SCHEDULE_PROD
    : process.env.CRON_SCHEDULE_DEV;

// Cron Job to permanently delete accounts after 30 days
cron.schedule(cronSchedule, async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const deletedUsers = await User.find({
        active: false,
        accountDeletionRequestDate: { $lte: thirtyDaysAgo },
      });

      await User.deleteMany({
        active: false,
        accountDeletionRequestDate: { $lte: thirtyDaysAgo },
      });

      // Log the deleted users
      if (deletedUsers.length > 0) {
        const logData = deletedUsers.map((user) => ({
          email: user.email,
          deletedAt: new Date(),
          deletionRequestDate: user.accountDeletionRequestDate,
        }));

        fs.appendFileSync(
          path.join(__dirname, 'deletion-log.txt'),
          JSON.stringify(logData, null, 2) + '\n'
        );

        console.log(
          'Production: Accounts older than 30 days have been deleted and logged.'
        );
      } else {
        console.log('Production: No accounts to delete.');
      }
    } else {
      // In development, delete accounts that have been marked as inactive
      const accountsToDelete = await User.find({
        active: false,
        accountDeletionRequestDate: { $lte: Date.now() },
      });

      if (accountsToDelete.length > 0) {
        await User.deleteMany({
          active: false,
          accountDeletionRequestDate: { $lte: Date.now() },
        });

        console.log('Development: Deleted inactive accounts.');
      } else {
        console.log('Development: No inactive accounts to delete.');
      }
    }
  } catch (error) {
    console.error('Error deleting accounts:', error);
  }
});

//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/trans', transRoueter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
