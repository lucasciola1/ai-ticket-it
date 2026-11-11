import { Router } from 'express';
import { validar } from '../middlewares/validar.js';
import { buscarEventosSchema, crearEventoSchema } from '../schemas/evento.schemas.js';
import { comprasDelEventoSchema } from '../schemas/compra.schemas.js';

export function categoriasRoutes({ controllers }) {
  const router = Router();
  router.get('/', controllers.categoriaController.listar);
  return router;
}

export function eventosRoutes({ controllers, middlewares }) {
  const router = Router();
  const { eventoController, compraController } = controllers;
  const { autenticar, autenticarOpcional } = middlewares;

  router.get('/', autenticarOpcional, validar({ query: buscarEventosSchema }), eventoController.buscar);
  router.post('/', autenticar, validar({ body: crearEventoSchema }), eventoController.crear);
  router.get('/:id', autenticarOpcional, eventoController.obtener);
  router.get(
    '/:id/compras',
    autenticar,
    validar({ query: comprasDelEventoSchema }),
    compraController.delEvento,
  );

  return router;
}

export function organizadoresRoutes({ controllers }) {
  const router = Router();
  router.get('/:id/resenias', controllers.reseniaController.deOrganizador);
  return router;
}
