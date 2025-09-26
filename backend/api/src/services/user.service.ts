import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { UserModel, USER_ROLES, UserRole, IUser } from '../models/user.model';

interface RegisterParams {
  email: string;
  password: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export const registerUser = async ({ email, password, role, profile }: RegisterParams) => {
  if (!USER_ROLES.includes(role)) {
    throw createHttpError(400, 'Invalid role');
  }

  // Normalize email to lowercase for consistent duplicate checking
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check for existing user first to provide better error message
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw createHttpError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const name = `${profile.firstName} ${profile.lastName}`;

    const user = await UserModel.create({ name, email: normalizedEmail, passwordHash, role });
    return user.toJSON();
  } catch (error: any) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      // Extract field name from duplicate key error
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      const value = error.keyValue?.[field] || 'unknown';
      throw createHttpError(409, `User with this ${field} '${value}' already exists`);
    }
    // Re-throw other errors (including our custom 409 error from above)
    throw error;
  }
};

interface AuthResult {
  token: string;
  user: ReturnType<typeof sanitizeUser>;
}

const sanitizeUser = (user: { toJSON: () => unknown }) => user.toJSON();

export const authenticateUser = async (email: string, password: string): Promise<AuthResult> => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { sub: (user._id as Types.ObjectId).toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );

  return {
    token,
    user: sanitizeUser(user)
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await UserModel.findById(userId).select('-passwordHash');
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  return user;
};

interface UpdateProfileParams {
  name?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  currentPassword?: string;
  newPassword?: string;
}

export const updateUserProfile = async (userId: string, updateData: UpdateProfileParams) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const updateFields: Partial<IUser> = {};

  // Handle name update from profile data
  if (updateData.profile?.firstName || updateData.profile?.lastName) {
    const firstName = updateData.profile.firstName || user.name.split(' ')[0];
    const lastName = updateData.profile.lastName || user.name.split(' ').slice(1).join(' ') || '';
    updateFields.name = `${firstName} ${lastName}`.trim();
  } else if (updateData.name) {
    updateFields.name = updateData.name;
  }

  // Handle password update
  if (updateData.newPassword && updateData.currentPassword) {
    const isCurrentPasswordValid = await bcrypt.compare(updateData.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw createHttpError(400, 'Current password is incorrect');
    }
    updateFields.passwordHash = await bcrypt.hash(updateData.newPassword, 10);
  }

  // Update user
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!updatedUser) {
    throw createHttpError(404, 'User not found');
  }

  return updatedUser;
};

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getAllUsers = async (params: GetUsersParams = {}) => {
  const {
    page = 1,
    limit = 50,
    search,
    role,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params;

  // Build filter query
  const filter: any = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    filter.role = role;
  }

  // Build sort options
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [users, totalCount] = await Promise.all([
    UserModel.find(filter)
      .select('-passwordHash')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    UserModel.countDocuments(filter)
  ]);

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1
    }
  };
};

export const deleteUser = async (userId: string) => {
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  return user;
};

interface UpdateUserParams {
  name?: string;
  email?: string;
  role?: UserRole;
}

export const updateUser = async (userId: string, updateData: UpdateUserParams) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!updatedUser) {
    throw createHttpError(404, 'User not found');
  }

  return updatedUser;
};
