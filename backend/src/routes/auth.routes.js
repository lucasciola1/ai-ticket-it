import { Router } from 'express';
import { validar } from '../middlewares/validar.js';
import { loginSchema, registroSchema } from '../schemas/auth.schemas.js';

export function authRoutes({ controllers }) {
  const router = Router();
  const { authController } = controllers;

  router.post('/register', validar({ body: registroSchema }), authController.registrar);
  router.post('/login', validar({ body: loginSchema }), authController.login);

  return router;
}
