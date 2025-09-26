import express from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['owner', 'oem', 'regulator', 'service_provider', 'admin']).optional().default('owner'),
    profile: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().optional(),
    })
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  })
});

// Public routes
router.post('/register', validateRequest(registerSchema), userController.register);
router.post('/login', validateRequest(loginSchema), userController.login);

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

export { router as userRouter };