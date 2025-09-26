import winston from 'winston';
import { env } from '../config/env';

const enumerateErrorFormat = winston.format((info: winston.Logform.TransformableInfo) => {
  if (info instanceof Error) {
    return Object.assign({ message: info.message, stack: info.stack }, info);
  }
  return info;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console({ format: winston.format.simple() })]
});
