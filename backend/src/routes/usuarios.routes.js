import { Router } from 'express';

export function usuariosRoutes({ controllers, middlewares }) {
  const router = Router();
  const { usuarioController, eventoController, compraController } = controllers;

  router.use(middlewares.autenticar);

  router.get('/me', usuarioController.me);
  router.get('/me/eventos', eventoController.misEventos);
  router.get('/me/compras', compraController.misCompras);
  router.get('/me/favoritos', eventoController.favoritos);
  router.put('/me/favoritos/:eventoId', eventoController.marcarFavorito);
  router.delete('/me/favoritos/:eventoId', eventoController.desmarcarFavorito);

  return router;
}
