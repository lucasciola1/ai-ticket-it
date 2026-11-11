import { UnauthorizedError } from '../domain/errors.js';

/**
 * Exige un header "Authorization: Bearer <token>" válido y deja
 * el usuario autenticado en req.usuario.
 */
export function crearAutenticar({ authService, usuarioRepository }) {
  return (req, res, next) => {
    const [esquema, token] = (req.headers.authorization ?? '').split(' ');
    if (esquema !== 'Bearer' || !token) {
      throw new UnauthorizedError('TOKEN_REQUERIDO', 'Tenés que iniciar sesión');
    }

    const payload = authService.verificarToken(token);
    const usuario = usuarioRepository.findById(payload.sub);
    if (!usuario) {
      throw new UnauthorizedError('TOKEN_INVALIDO', 'La sesión no es válida');
    }

    req.usuario = usuario;
    next();
  };
}
