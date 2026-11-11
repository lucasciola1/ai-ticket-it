import {
  CategoriaRepository,
  CompraRepository,
  EventoRepository,
  ReseniaRepository,
  UsuarioRepository,
} from './repositories/index.js';
import { AuthService } from './services/AuthService.js';
import { CategoriaService } from './services/CategoriaService.js';
import { ReseniaService } from './services/ReseniaService.js';
import { EventoService } from './services/EventoService.js';
import { CompraService } from './services/CompraService.js';
import { AuthController } from './controllers/AuthController.js';
import { UsuarioController } from './controllers/UsuarioController.js';
import {
  CategoriaController,
  EventoController,
  ReseniaController,
} from './controllers/CatalogoControllers.js';
import { CompraController } from './controllers/CompraController.js';
import { crearAutenticar } from './middlewares/autenticar.js';

/**
 * Inyección de dependencias manual: repositorios → services → controllers.
 * Cada test puede armar su propio container aislado (y fijar "ahora").
 */
export function createContainer(config) {
  const ahora = config.ahora ?? (() => new Date());

  const repositories = {
    usuarioRepository: new UsuarioRepository(),
    categoriaRepository: new CategoriaRepository(),
    eventoRepository: new EventoRepository(),
    compraRepository: new CompraRepository(),
    reseniaRepository: new ReseniaRepository(),
  };

  const authService = new AuthService({
    usuarioRepository: repositories.usuarioRepository,
    jwtSecret: config.jwtSecret,
    jwtExpiresIn: config.jwtExpiresIn,
    saltRounds: config.bcryptSaltRounds,
  });
  const reseniaService = new ReseniaService({ ...repositories, ahora });
  const services = {
    authService,
    reseniaService,
    categoriaService: new CategoriaService(repositories),
    eventoService: new EventoService({ ...repositories, reseniaService, ahora }),
    compraService: new CompraService({ ...repositories, ahora }),
  };

  const controllers = {
    authController: new AuthController(services),
    usuarioController: new UsuarioController(),
    categoriaController: new CategoriaController(services),
    eventoController: new EventoController(services),
    reseniaController: new ReseniaController(services),
    compraController: new CompraController(services),
  };

  const dependenciasAuth = { authService, usuarioRepository: repositories.usuarioRepository };
  const middlewares = {
    autenticar: crearAutenticar(dependenciasAuth),
    autenticarOpcional: crearAutenticar({ ...dependenciasAuth, opcional: true }),
  };

  return { repositories, services, controllers, middlewares };
}
