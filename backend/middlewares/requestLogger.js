import morgan from 'morgan';
import logger from '../config/logger.js';

// Define custom tokens
morgan.token('message', (req, res) => res.locals.errorMessage || '');

// Request format
const getIpFormat = () =>
  process.env.NODE_ENV === 'production' ? ':remote-addr - ' : '';

const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

// Success handler
export const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: logger.stream,
});

// Error handler
export const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: logger.stream,
});
