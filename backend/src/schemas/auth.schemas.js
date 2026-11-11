import { z } from 'zod';

const email = z
  .string({ error: 'El email es obligatorio' })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'El email no es válido' }));

const textoObligatorio = (campo) =>
  z
    .string({ error: `El ${campo} es obligatorio` })
    .trim()
    .min(1, `El ${campo} es obligatorio`)
    .max(50, `El ${campo} no puede superar los 50 caracteres`);

export const registroSchema = z.object({
  nombre: textoObligatorio('nombre'),
  apellido: textoObligatorio('apellido'),
  email,
  // bcrypt solo usa los primeros 72 bytes
  password: z
    .string({ error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar los 72 caracteres'),
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'La contraseña es obligatoria' }).min(1, 'La contraseña es obligatoria'),
});
