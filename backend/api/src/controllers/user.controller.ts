import { Request, Response } from 'express';
import { registerUser, authenticateUser, getUserProfile, updateUserProfile, getAllUsers, updateUser as updateUserService, deleteUser as deleteUserService } from '../services/user.service';
import { createAuditLog } from '../services/audit.service';
import { Types } from 'mongoose';
import { wrapAsync } from '../middlewares/errorHandler';
import createHttpError from 'http-errors';

export const register = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await registerUser(req.body);
    const userId = user && '_id' in user ? (user._id as Types.ObjectId).toString() : undefined;
    
    // Log successful registration
    await createAuditLog(req, 'user_register', 'User', userId, {
      email: req.body.email,
      role: req.body.role
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error: any) {
    // If it's already an HTTP error (from service layer), re-throw it
    if (error.status || error.statusCode) {
      throw error;
    }
    
    // Handle unexpected MongoDB duplicate key errors that might slip through
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      const value = error.keyValue?.[field] || 'unknown';
      throw createHttpError(409, `User with this ${field} '${value}' already exists`);
    }
    
    // Handle other unexpected errors
    throw createHttpError(500, 'Failed to register user');
  }
});

export const login = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createHttpError(400, 'Email and password are required');
    }
    const result = await authenticateUser(email, password);
    res.json(result);
  } catch (error: any) {
    if (error.status === 401) {
      throw error;
    }
    throw createHttpError(500, 'Failed to authenticate user');
  }
});

export const getProfile = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const userFromToken = req.user as { _id: Types.ObjectId };
    // If no ID parameter, get current user's profile
    const userId = req.params.id ? 
      (req.params.id === 'me' ? userFromToken._id.toString() : req.params.id) :
      userFromToken._id.toString();
    
    if (!userId) {
      throw createHttpError(400, 'User ID is required');
    }
    
    const user = await getUserProfile(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    
    res.json(user);
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw createHttpError(500, 'Failed to retrieve user profile');
  }
});

export const updateProfile = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const userFromToken = req.user as { _id: Types.ObjectId };
    const userId = userFromToken._id.toString();
    
    if (!userId) {
      throw createHttpError(400, 'User ID is required');
    }
    
    const updatedUser = await updateUserProfile(userId, req.body);
    
    // Log successful profile update
    await createAuditLog(req, 'user_profile_update', 'User', userId, {
      updatedFields: Object.keys(req.body)
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw createHttpError(500, 'Failed to update user profile');
  }
});

export const getUsers = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, role, sortBy, sortOrder } = req.query;
    
    const result = await getAllUsers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      role: role as any,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });
    
    res.json(result);
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw createHttpError(500, 'Failed to retrieve users');
  }
});

export const updateUser = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedUser = await updateUserService(id, req.body);
    
    // Log successful user update
    const userFromToken = req.user as { _id: Types.ObjectId };
    await createAuditLog(req, 'user_update', 'User', id, {
      updatedBy: userFromToken._id.toString(),
      updatedFields: Object.keys(req.body)
    });
    
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw createHttpError(500, 'Failed to update user');
  }
});

export const deleteUser = wrapAsync(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteUserService(id);
    
    // Log successful user deletion
    const userFromToken = req.user as { _id: Types.ObjectId };
    await createAuditLog(req, 'user_delete', 'User', id, {
      deletedBy: userFromToken._id.toString()
    });
    
    res.json({
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    if (error.status) {
      throw error;
    }
    throw createHttpError(500, 'Failed to delete user');
  }
});

export const userController = {
  register,
  login,
  getProfile,
  updateProfile,
  getUsers,
  updateUser,
  deleteUser
};
