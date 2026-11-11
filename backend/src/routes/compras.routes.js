import { Router } from 'express';
import { validar } from '../middlewares/validar.js';
import { crearCompraSchema, mensajeSchema, reseniaSchema } from '../schemas/compra.schemas.js';

export function comprasRoutes({ controllers, middlewares }) {
  const router = Router();
  const { compraController, reseniaController } = controllers;

  router.use(middlewares.autenticar);

  router.post('/', validar({ body: crearCompraSchema }), compraController.crear);
  router.get('/:id', compraController.obtener);
  router.post('/:id/pagar', compraController.pagar);
  router.post('/:id/cancelar', compraController.cancelar);
  router.post('/:id/utilizar', compraController.utilizar);
  router.get('/:id/mensajes', compraController.mensajes);
  router.post('/:id/mensajes', validar({ body: mensajeSchema }), compraController.enviarMensaje);
  router.post('/:id/resenia', validar({ body: reseniaSchema }), reseniaController.crear);

  return router;
}
