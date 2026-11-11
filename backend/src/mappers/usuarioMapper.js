/** Datos del usuario autenticado. Nunca expone passwordHash. */
export const toUsuarioDTO = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  email: usuario.email,
  favoritos: [...usuario.favoritos],
});

/** Lo que se muestra de otro usuario (sin email). */
export const toUsuarioPublicoDTO = (usuario) =>
  usuario ? { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido } : null;
