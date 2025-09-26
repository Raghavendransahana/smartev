import { Schema, Document, Model, Types, model } from 'mongoose';

export interface IAuditLog {
  actor?: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export interface IAuditLogDocument extends IAuditLog, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLogModel extends Model<IAuditLogDocument> {}

const auditLogSchema = new Schema<IAuditLogDocument, IAuditLogModel>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ action: 1, createdAt: -1 });

auditLogSchema.index({ entityType: 1, entityId: 1 });

export const AuditLogModel = model<IAuditLogDocument, IAuditLogModel>('AuditLog', auditLogSchema);
