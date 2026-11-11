import { z } from 'zod';
import { EstadoCompra } from '../domain/EstadoCompra.js';

export const crearCompraSchema = z.object({
  eventoId: z.string({ error: 'El evento es obligatorio' }).min(1, 'El evento es obligatorio'),
  tipoEntradaId: z
    .string({ error: 'El tipo de entrada es obligatorio' })
    .min(1, 'El tipo de entrada es obligatorio'),
  cantidad: z
    .number({ error: 'La cantidad tiene que ser un número' })
    .int('La cantidad tiene que ser un número entero')
    .min(1, 'La cantidad tiene que ser al menos 1')
    .max(10, 'Máximo 10 entradas por compra'),
});

export const comprasDelEventoSchema = z.object({
  estado: z
    .enum(Object.values(EstadoCompra), { error: 'El estado no es válido' })
    .optional(),
});

export const mensajeSchema = z.object({
  texto: z
    .string({ error: 'El mensaje es obligatorio' })
    .trim()
    .min(1, 'El mensaje no puede estar vacío')
    .max(1000, 'El mensaje no puede superar los 1000 caracteres'),
});

export const reseniaSchema = z.object({
  puntuacion: z
    .number({ error: 'La puntuación tiene que ser un número' })
    .int('La puntuación tiene que ser un número entero')
    .min(1, 'La puntuación mínima es 1')
    .max(5, 'La puntuación máxima es 5'),
  detalle: z.string().trim().max(1000, 'El comentario no puede superar los 1000 caracteres').default(''),
});
