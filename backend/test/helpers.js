import request from 'supertest';
import { createContainer } from '../src/container.js';
import { createApp } from '../src/app.js';
import { cargarSeed, SEED_PASSWORD } from '../src/seed/seed.js';

/** App aislada con el seed cargado y helpers para loguearse y hacer requests. */
export function crearAppConSeed() {
  const container = createContainer({ jwtSecret: 'secreto-de-test', bcryptSaltRounds: 4 });
  cargarSeed(container.repositories, { saltRounds: 4 });
  const app = createApp(container);

  const login = async (nombre) => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: `${nombre}@aiticketit.test`, password: SEED_PASSWORD })
      .expect(200);
    return res.body.token;
  };

  /** Cliente con el token de un usuario: como('sofia').get('/usuarios/me') */
  const como = async (nombre) => {
    const token = await login(nombre);
    const conToken = (metodo) => (url) => request(app)[metodo](url).set('Authorization', `Bearer ${token}`);
    return { get: conToken('get'), post: conToken('post'), put: conToken('put'), delete: conToken('delete') };
  };

  const evento = (nombre) => container.repositories.eventoRepository.findOne((e) => e.nombre === nombre);
  const usuario = (nombre) =>
    container.repositories.usuarioRepository.findByEmail(`${nombre}@aiticketit.test`);

  return { app, container, como, evento, usuario };
}
