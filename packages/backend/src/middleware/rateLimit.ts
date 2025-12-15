import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware
 * Prevents abuse and DDoS attacks
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
        error: 'Too many login attempts, please try again later.'
    },
    skipSuccessfulRequests: true
});
