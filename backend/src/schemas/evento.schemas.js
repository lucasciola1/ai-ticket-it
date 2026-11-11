import { z } from 'zod';

const tipoEntradaSchema = z.object({
  nombre: z
    .string({ error: 'El nombre del tipo de entrada es obligatorio' })
    .trim()
    .min(1, 'El nombre del tipo de entrada es obligatorio')
    .max(50, 'El nombre del tipo de entrada no puede superar los 50 caracteres'),
  descripcion: z.string().trim().max(200).default(''),
  precio: z
    .number({ error: 'El precio tiene que ser un número' })
    .nonnegative('El precio no puede ser negativo'),
  cupo: z
    .number({ error: 'El cupo tiene que ser un número' })
    .int('El cupo tiene que ser un número entero')
    .min(1, 'El cupo tiene que ser al menos 1'),
});

export const crearEventoSchema = z.object({
  nombre: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  descripcion: z.string().trim().max(2000, 'La descripción es demasiado larga').default(''),
  categoriaId: z.string({ error: 'La categoría es obligatoria' }).min(1, 'La categoría es obligatoria'),
  fecha: z.coerce
    .date({ error: 'La fecha no es válida' })
    .refine((fecha) => fecha > new Date(), 'La fecha del evento tiene que ser futura'),
  lugar: z
    .string({ error: 'El lugar es obligatorio' })
    .trim()
    .min(1, 'El lugar es obligatorio')
    .max(150, 'El lugar no puede superar los 150 caracteres'),
  multimedia: z
    .array(z.url({ error: 'Cada archivo multimedia tiene que ser una URL válida' }))
    .max(10, 'Máximo 10 archivos multimedia')
    .default([]),
  tiposEntrada: z
    .array(tipoEntradaSchema, { error: 'Los tipos de entrada son obligatorios' })
    .min(1, 'El evento tiene que tener al menos un tipo de entrada')
    .max(10, 'Máximo 10 tipos de entrada')
    .refine(
      (tipos) => new Set(tipos.map((t) => t.nombre.toLowerCase())).size === tipos.length,
      'Los tipos de entrada no pueden repetir nombre',
    ),
});

export const buscarEventosSchema = z
  .object({
    q: z.string().trim().optional(),
    categoriaId: z.string().optional(),
    precioMin: z.coerce.number().nonnegative('precioMin no puede ser negativo').optional(),
    precioMax: z.coerce.number().nonnegative('precioMax no puede ser negativo').optional(),
    orden: z.enum(['precio', 'fecha', 'puntaje'], { error: 'orden debe ser precio, fecha o puntaje' }).default('fecha'),
    dir: z.enum(['asc', 'desc'], { error: 'dir debe ser asc o desc' }).optional(),
    page: z.coerce.number().int().min(1, 'page debe ser 1 o más').default(1),
    limit: z.coerce.number().int().min(1).max(50, 'limit no puede superar 50').default(10),
  })
  .refine(
    ({ precioMin, precioMax }) =>
      precioMin === undefined || precioMax === undefined || precioMin <= precioMax,
    { error: 'precioMin no puede ser mayor que precioMax', path: ['precioMin'] },
  );
