import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createWriteStream } from 'fs';
import path from 'path';
import { routes } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { requestContext } from './middlewares/requestContext';
import { apiLimiter } from './middlewares/rateLimiter';

const app = express();

app.use(helmet());

// CORS configuration for production-grade security
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:8081', // Backend API
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8081',
    // Add production URLs when deploying
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));
app.use(requestContext);
app.use(apiLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const accessLogStream = createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
