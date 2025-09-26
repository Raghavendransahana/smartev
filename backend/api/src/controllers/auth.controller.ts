import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
    role: 'Super Admin' | 'Admin' | 'Seller';
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Seller';
  avatar?: string;
  brandId?: string;
  isFirstLogin?: boolean;
  permissions?: string[];
}

// Mock user database - replace with actual database queries
const mockUsers = [
  {
    id: '1',
    email: 'admin@smartev.com',
    password: '$2a$10$Eo9PQAJjHEE3TDYyYK.0k.xb5Z0gzTi3WQHGBe4uM1QgCjXhQ.mBW', // admin123
    name: 'Super Administrator',
    role: 'Super Admin' as const,
    permissions: ['*'],
  },
  {
    id: '2',
    email: 'brand@smartev.com',
    password: '$2a$10$Eo9PQAJjHEE3TDYyYK.0k.xb5Z0gzTi3WQHGBe4uM1QgCjXhQ.mBW', // admin123
    name: 'Brand Administrator',
    role: 'Admin' as const,
    brandId: 'brand-1',
    isFirstLogin: true,
    permissions: ['users:read', 'users:write', 'stations:read', 'stations:write', 'complaints:write', 'analytics:read'],
  },
  {
    id: '3',
    email: 'agent@smartev.com',
    password: '$2a$10$Eo9PQAJjHEE3TDYyYK.0k.xb5Z0gzTi3WQHGBe4uM1QgCjXhQ.mBW', // admin123
    name: 'Sales Agent',
    role: 'Seller' as const,
    permissions: ['marketplace:read', 'marketplace:write', 'transactions:write', 'analytics:read'],
  },
];

const JWT_SECRET = process.env.JWT_SECRET || 'smartev-jwt-secret-key-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const authController = {
  /**
   * Login user with email, password, and role
   */
  login: async (req: LoginRequest, res: Response) => {
    try {
      const { email, password, role } = req.body;

      logger.info(`Login attempt: ${email} as ${role}`);

      // Find user by email and role
      const user = mockUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.role === role
      );

      if (!user) {
        logger.warn(`Login failed: User not found - ${email} as ${role}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials or role mismatch'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logger.warn(`Login failed: Invalid password - ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Prepare user data (excluding password)
      const userData: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        brandId: user.brandId,
        isFirstLogin: user.isFirstLogin,
        permissions: user.permissions,
      };

      logger.info(`Login successful: ${email} as ${role}`);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userData,
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  },

  /**
   * Validate JWT token and return user data
   */
  validateToken: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No valid token provided'
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        // Find user by ID
        const user = mockUsers.find(u => u.id === decoded.userId);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }

        // Prepare user data (excluding password)
        const userData: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          brandId: user.brandId,
          isFirstLogin: user.isFirstLogin,
          permissions: user.permissions,
        };

        res.json({
          success: true,
          user: userData,
        });

      } catch (jwtError) {
        logger.warn('Invalid token:', jwtError);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

    } catch (error) {
      logger.error('Token validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token validation'
      });
    }
  },

  /**
   * Logout user (optional - for token blacklisting in production)
   */
  logout: async (req: Request, res: Response) => {
    try {
      // In production, you might want to blacklist the token
      // For now, just send a success response
      
      logger.info('User logout');
      
      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  },

  /**
   * Send password reset email
   */
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      logger.info(`Password reset requested for: ${email}`);

      // In production, you would:
      // 1. Check if user exists
      // 2. Generate reset token
      // 3. Save token to database with expiry
      // 4. Send email with reset link

      // For demo purposes, just return success
      res.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link shortly.'
      });

    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      logger.info(`Password reset attempt with token: ${token.substring(0, 10)}...`);

      // In production, you would:
      // 1. Verify reset token
      // 2. Check token expiry
      // 3. Hash new password
      // 4. Update user password
      // 5. Invalidate reset token

      // For demo purposes, just return success
      res.json({
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.'
      });

    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};