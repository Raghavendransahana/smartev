import { Request } from 'express';
import { AuditLogModel } from '../models/auditLog.model';

export const createAuditLog = async (
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) => {
  const actorId = req.user?._id;
  const ip = req.ip;

  return AuditLogModel.create({
    actor: actorId,
    action,
    entityType,
    entityId,
    metadata,
    ipAddress: ip
  });
};

export const getAuditLogs = async (limit = 100) => {
  return AuditLogModel.find().sort({ createdAt: -1 }).limit(limit).lean();
};
