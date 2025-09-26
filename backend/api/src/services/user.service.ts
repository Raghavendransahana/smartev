import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { UserModel, USER_ROLES, UserRole } from '../models/user.model';

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

  const existing = await UserModel.findOne({ email });
  if (existing) {
    throw createHttpError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const name = `${profile.firstName} ${profile.lastName}`;

  const user = await UserModel.create({ name, email, passwordHash, role });
  return user.toJSON();
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
