import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(helmet({ 
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false 
}));
app.use(cors({ origin: env.frontendUrl === '*' ? '*' : env.frontendUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), env.uploadDir)));

// Backend API routes
app.use('/api', routes);

// Serve frontend static files
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// For all non-API paths, serve the frontend index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);
