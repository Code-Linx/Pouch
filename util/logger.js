const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
  level: 'info', // Log only if level is 'info' or lower (e.g. 'error')
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Log stack trace for errors
    logFormat
  ),
  transports: [
    new transports.Console(), // Logs to console
    new transports.File({ filename: 'error.log', level: 'error' }), // Error logs
    new transports.File({ filename: 'combined.log' }), // All logs
  ],
});

// Export logger for use in other files
module.exports = logger;
