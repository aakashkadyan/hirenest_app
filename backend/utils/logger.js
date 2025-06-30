const pino = require('pino');

// Define options for Pino
const pinoOptions = {
  level: process.env.LOG_LEVEL || 'info', // Default to 'info'
};

// In development, we want to "pretty print" the logs
if (process.env.NODE_ENV !== 'production') {
  pinoOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true, // Add colors
      translateTime: 'yyyy-mm-dd HH:MM:ss.l', // Better time format with milliseconds
      ignore: 'pid,hostname', // Don't show process ID and hostname
      messageFormat: '{time} [{level}] {msg}', // Clean message format
      levelFirst: false,
      singleLine: true,
    },
  };
} else {
  // Production: log to file
  pinoOptions.transport = {
    target: 'pino/file',
    options: {
      destination: './app.log', // Log file path
      mkdir: true
    }
  };
}

// Create the logger instance
const logger = pino(pinoOptions);

module.exports = logger;
