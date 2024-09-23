const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const { AppError } = require('./util/appError');
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const transRoueter = require('./routes/transcationRoute');
const globalErrorHandler = require('./controllers/ErrorController');

// START APP
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//DEVELOPMENT LOGGING
if ((process.env.NODE_ENV = 'development')) {
  app.use(morgan('dev'));
}

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//ROUTES
app.use('/', userRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/trans', transRoueter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
