/** Nunca expone passwordHash. */
export const toUsuarioDTO = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  email: usuario.email,
  favoritos: [...usuario.favoritos],
});
