/**
 * Centralized Environment Configuration
 * 
 * This module loads, validates, and exports all environment variables.
 * It ensures that the application fails fast if required variables are missing
 * and provides different configurations for development vs production environments.
 * 
 * Call this module early in server startup to validate the environment.
 */

const NODE_ENV = process.env.NODE_ENV || 'development';

// Validation helper
const requireEnv = (varName, fallback = null) => {
  const value = process.env[varName];
  
  if (!value && fallback === null) {
    throw new Error(
      `Missing required environment variable: ${varName}\n` +
      `Please check your .env or .env.production file.`
    );
  }
  
  return value || fallback;
};

// Validate critical variables based on environment
const validateEnvironment = () => {
  const errors = [];

  // Always required
  try {
    requireEnv('DATABASE_URL');
  } catch (e) {
    errors.push(e.message);
  }

  // Production-specific requirements
  if (NODE_ENV === 'production') {
    try {
      requireEnv('JWT_SECRET');
      // Verify that production JWT_SECRET is not the default
      if (process.env.JWT_SECRET === 'asqswfved1652e627dg3d2fd6273dgwe') {
        errors.push(
          'SECURITY ERROR: JWT_SECRET in production must not be the default value.\n' +
          'Generate a strong secret and set it in your production environment.'
        );
      }
    } catch (e) {
      errors.push(e.message);
    }

    try {
      requireEnv('FRONTEND_URL');
    } catch (e) {
      errors.push(e.message);
    }
  }

  // If any errors, throw them all at once
  if (errors.length > 0) {
    throw new Error(
      'Environment validation failed:\n' +
      errors.join('\n')
    );
  }
};

// Build the config object
const config = {
  // Environment
  NODE_ENV,
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',

  // Server
  PORT: parseInt(process.env.PORT || 5000, 10),
  BACKEND_URL: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Redis (Optional, for Socket.IO scaling)
  REDIS_URL: process.env.REDIS_URL || null,

  // Frontend (CORS & redirects)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'asqswfved1652e627dg3d2fd6273dgwe',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  // Email Service (optional, but logs in development if missing)
  EMAIL_USER: process.env.EMAIL_USER || null,
  EMAIL_PASS: process.env.EMAIL_PASS || null,
  EMAIL: process.env.EMAIL || null,
};

// Validate on import
validateEnvironment();

// Log environment on startup (useful for debugging)
if (config.isDevelopment) {
  console.log('🔧 Environment Configuration (Development Mode):');
  console.log(`   NODE_ENV: ${config.NODE_ENV}`);
  console.log(`   PORT: ${config.PORT}`);
  console.log(`   DATABASE_URL: Connected`);
  console.log(`   FRONTEND_URL: ${config.FRONTEND_URL}`);
  console.log(`   JWT_SECRET: ${config.JWT_SECRET === 'asqswfved1652e627dg3d2fd6273dgwe' ? '[DEFAULT]' : '[CUSTOM]'}`);
  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    console.log(`   EMAIL: Not configured (will log emails to console)`);
  }
  console.log('');
} else if (config.isProduction) {
  console.log('✅ Environment Configuration (Production Mode) validated');
}

module.exports = config;
