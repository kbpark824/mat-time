// Application configuration constants
module.exports = {
  // Rate limiting configuration
  RATE_LIMITING: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes in milliseconds
    GENERAL_MAX_REQUESTS: 500, // General API requests per window
    AUTH_MAX_ATTEMPTS: 15, // Authentication attempts per window (increased from 5 to 15)
    WEBHOOK_MAX_REQUESTS: 10, // Webhook requests per window
  },

  // Validation limits
  VALIDATION: {
    MAX_NOTE_LENGTH: 5000, // Maximum characters for technique/rolling notes
    MAX_TAG_LENGTH: 50, // Maximum characters per tag
    MAX_TAGS_PER_ITEM: 20, // Maximum number of tags per session/seminar/competition
    MAX_WEIGHT_DIVISION_LENGTH: 50, // Maximum characters for weight division
    MAX_URL_PARAMETERS: 20, // Maximum URL parameters to prevent HPP attacks
  },

  // Time constants
  TIME: {
    ONE_DAY_MS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds (86400000)
    FIFTEEN_MINUTES_MS: 15 * 60 * 1000, // 15 minutes in milliseconds
    ONE_YEAR_SECONDS: 365 * 24 * 60 * 60, // 1 year in seconds for HSTS
  },

  // Security settings
  SECURITY: {
    HSTS_MAX_AGE: 31536000, // 1 year in seconds
    MIN_JWT_SECRET_LENGTH: 32, // Minimum JWT secret length
    BODY_SIZE_LIMIT: '10mb', // Maximum request body size
  },

  // Default server configuration
  SERVER: {
    DEFAULT_PORT: 5001,
  },

  // Validation error messages (to reduce duplication)
  ERROR_MESSAGES: {
    TECHNIQUE_NOTES_TOO_LONG: 'Technique notes cannot exceed 5000 characters',
    ROLLING_NOTES_TOO_LONG: 'Rolling notes cannot exceed 5000 characters',
    GENERAL_NOTES_TOO_LONG: 'General notes cannot exceed 5000 characters',
    TAG_TOO_LONG: 'Each tag cannot exceed 50 characters',
    TOO_MANY_TAGS: 'Cannot have more than 20 tags',
    WEIGHT_DIVISION_TOO_LONG: 'Weight division cannot exceed 50 characters',
    RATE_LIMIT_GENERAL: 'Too many requests from this IP, please try again later.',
    RATE_LIMIT_AUTH: 'Too many authentication attempts from this IP, please try again later.',
  },
};