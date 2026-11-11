import { Router } from 'express';

export function usuariosRoutes({ controllers, middlewares }) {
  const router = Router();
  const { usuarioController } = controllers;

  router.use(middlewares.autenticar);
  router.get('/me', usuarioController.me);

  return router;
}
