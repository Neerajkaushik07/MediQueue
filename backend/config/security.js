import helmet from 'helmet';

/**
 * Security configuration using Helmet
 * Applies various security headers to protect against common vulnerabilities
 */
export const securityConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Frame Guard - prevent clickjacking
  frameguard: { action: 'deny' },
  
  // Hide Powered-By header
  hidePoweredBy: true,
  
  // HSTS - force HTTPS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  
  // IE No Open - prevent IE from executing downloads
  ieNoOpen: true,
  
  // No Sniff - prevent MIME type sniffing
  noSniff: true,
  
  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  
  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },
  
  // XSS Filter
  xssFilter: true,
});

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  exposedHeaders: ['token'],
  maxAge: 86400, // 24 hours
};
