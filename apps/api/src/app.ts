import express, { type Express } from 'express';
import cors from 'cors';
import passport from './config/passport.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Initialize Passport
  app.use(passport.initialize());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
