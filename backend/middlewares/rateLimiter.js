import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for all requests
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased for development - Limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased for development - Limit each IP to 50 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Too many login attempts, please try again after 15 minutes.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes.',
    });
  },
});

/**
 * API rate limiter for API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Increased for development - Limit each IP to 100 requests per minute
  message: 'Too many API requests, please slow down.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
    });
  },
});

/**
 * Payment rate limiter
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment attempts per hour
  message: 'Too many payment attempts, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many payment attempts. Please contact support if you need assistance.',
    });
  },
});
