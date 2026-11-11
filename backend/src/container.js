import {
  CategoriaRepository,
  CompraRepository,
  EventoRepository,
  ReseniaRepository,
  UsuarioRepository,
} from './repositories/index.js';
import { AuthService } from './services/AuthService.js';
import { AuthController } from './controllers/AuthController.js';
import { UsuarioController } from './controllers/UsuarioController.js';
import { crearAutenticar } from './middlewares/autenticar.js';

/**
 * Inyección de dependencias manual: repositorios → services → controllers.
 * Cada test puede armar su propio container aislado.
 */
export function createContainer(config) {
  const repositories = {
    usuarioRepository: new UsuarioRepository(),
    categoriaRepository: new CategoriaRepository(),
    eventoRepository: new EventoRepository(),
    compraRepository: new CompraRepository(),
    reseniaRepository: new ReseniaRepository(),
  };

  const services = {
    authService: new AuthService({
      usuarioRepository: repositories.usuarioRepository,
      jwtSecret: config.jwtSecret,
      jwtExpiresIn: config.jwtExpiresIn,
      saltRounds: config.bcryptSaltRounds,
    }),
  };

  const controllers = {
    authController: new AuthController(services),
    usuarioController: new UsuarioController(),
  };

  const middlewares = {
    autenticar: crearAutenticar({
      authService: services.authService,
      usuarioRepository: repositories.usuarioRepository,
    }),
  };

  return { repositories, services, controllers, middlewares };
}
