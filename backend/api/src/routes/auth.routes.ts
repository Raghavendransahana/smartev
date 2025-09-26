import express from 'express';
import { authController } from '../controllers/auth.controller';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate user with email, password, and role
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/validate
 * Validate JWT token and return user data
 */
router.post('/validate', authController.validateToken);

/**
 * POST /api/auth/logout
 * Logout user (optional - mainly for token blacklisting in production)
 */
router.post('/logout', authController.logout);

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', authController.resetPassword);

export { router as authRoutes };