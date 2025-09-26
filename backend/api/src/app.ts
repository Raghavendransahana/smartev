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
app.use(cors());
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
