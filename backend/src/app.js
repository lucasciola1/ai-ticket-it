import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes.js';
import { usuariosRoutes } from './routes/usuarios.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export function createApp(container) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRoutes(container));
  app.use('/usuarios', usuariosRoutes(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
