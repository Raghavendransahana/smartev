import { Schema, Document, Model, model } from 'mongoose';

export const USER_ROLES = ['owner', 'oem', 'regulator', 'service_provider', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUserDocument> {}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true, default: 'owner' }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Partial<IUserDocument & { passwordHash?: string }>) => {
        if (ret.passwordHash) {
          delete ret.passwordHash;
        }
        return ret;
      }
    }
  }
);

userSchema.index({ email: 1 }, { unique: true });

export const UserModel = model<IUserDocument, IUserModel>('User', userSchema);
