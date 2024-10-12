const { createLogger, format, transports } = require('winston');
const { combine, timestamp, errors, printf } = format;

// Define log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`; // Log the stack trace if there is an error, otherwise just log the message
});

// Security logger configuration
const securityLogger = createLogger({
  level: 'warn', // Use 'warn' or 'error' for security-related events
  format: combine(timestamp(), errors({ stack: true }), logFormat),
  transports: [
    new transports.File({ filename: 'security.log' }), // Log to a separate file for security events
  ],
});

module.exports = securityLogger;
