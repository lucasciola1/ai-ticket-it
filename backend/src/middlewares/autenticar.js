import { UnauthorizedError } from '../domain/errors.js';

/**
 * Lee "Authorization: Bearer <token>", lo verifica y deja el usuario en req.usuario.
 * - obligatorio (default): sin token válido → 401.
 * - opcional: si no hay token válido sigue como anónimo (sirve para marcar favoritos en el catálogo).
 */
export function crearAutenticar({ authService, usuarioRepository, opcional = false }) {
  return (req, res, next) => {
    const [esquema, token] = (req.headers.authorization ?? '').split(' ');
    if (esquema !== 'Bearer' || !token) {
      if (opcional) return next();
      throw new UnauthorizedError('TOKEN_REQUERIDO', 'Tenés que iniciar sesión');
    }

    try {
      const payload = authService.verificarToken(token);
      const usuario = usuarioRepository.findById(payload.sub);
      if (!usuario) {
        throw new UnauthorizedError('TOKEN_INVALIDO', 'La sesión no es válida');
      }
      req.usuario = usuario;
    } catch (error) {
      if (!opcional) throw error;
    }
    next();
  };
}
