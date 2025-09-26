import express from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .toLowerCase()
      .trim()
      .max(255, 'Email must be less than 255 characters'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters'),
    role: z.enum(['owner', 'oem', 'regulator', 'service_provider', 'admin']).optional().default('owner'),
    profile: z.object({
      firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters')
        .trim(),
      lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters')
        .trim(),
      phone: z.string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
        .max(20, 'Phone number must be less than 20 characters')
        .optional(),
    })
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(1, 'Password is required'),
  })
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters')
      .trim()
      .optional(),
    profile: z.object({
      firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name must be less than 50 characters')
        .trim()
        .optional(),
      lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be less than 50 characters')
        .trim()
        .optional(),
      phone: z.string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
        .max(20, 'Phone number must be less than 20 characters')
        .optional(),
    }).optional(),
    currentPassword: z.string()
      .min(1, 'Current password is required when changing password')
      .optional(),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'New password must be less than 128 characters')
      .optional(),
  }).refine(data => {
    // If newPassword is provided, currentPassword must also be provided
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  }, {
    message: 'Current password is required when changing password',
    path: ['currentPassword']
  })
});

// Public routes
router.post('/register', validateRequest(registerSchema), userController.register);
router.post('/login', validateRequest(loginSchema), userController.login);

const updateUserSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters')
      .trim()
      .optional(),
    email: z.string()
      .email('Invalid email format')
      .toLowerCase()
      .trim()
      .max(255, 'Email must be less than 255 characters')
      .optional(),
    role: z.enum(['owner', 'oem', 'regulator', 'service_provider', 'admin']).optional(),
  })
});

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/profile/:id', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), userController.updateProfile);

// Admin-only routes for user management
router.get('/', authMiddleware, userController.getUsers);
router.put('/:id', authMiddleware, validateRequest(updateUserSchema), userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

export { router as userRouter };