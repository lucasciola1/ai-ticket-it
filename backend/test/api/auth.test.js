import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createContainer } from '../../src/container.js';
import { createApp } from '../../src/app.js';

const nuevoUsuario = {
  nombre: 'Lucía',
  apellido: 'Gómez',
  email: 'Lucia@Ejemplo.test',
  password: 'secreta123',
};

let app;
beforeEach(() => {
  const container = createContainer({ jwtSecret: 'secreto-de-test', bcryptSaltRounds: 4 });
  app = createApp(container);
});

describe('POST /auth/register', () => {
  it('registra, devuelve token y nunca expone el hash', async () => {
    const res = await request(app).post('/auth/register').send(nuevoUsuario).expect(201);
    assert.ok(res.body.token);
    assert.equal(res.body.usuario.email, 'lucia@ejemplo.test');
    assert.equal(res.body.usuario.passwordHash, undefined);
  });

  it('rechaza emails repetidos con 409', async () => {
    await request(app).post('/auth/register').send(nuevoUsuario).expect(201);
    const res = await request(app)
      .post('/auth/register')
      .send({ ...nuevoUsuario, email: 'lucia@ejemplo.test' })
      .expect(409);
    assert.equal(res.body.error.codigo, 'EMAIL_EN_USO');
  });

  it('valida el body con Zod y devuelve los campos inválidos', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ nombre: '', email: 'no-es-email', password: '123' })
      .expect(400);
    assert.equal(res.body.error.codigo, 'VALIDACION');
    const campos = res.body.error.detalles.map((d) => d.campo).sort();
    assert.deepEqual(campos, ['apellido', 'email', 'nombre', 'password']);
  });

  it('responde 400 si el JSON está mal formado', async () => {
    const res = await request(app)
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"nombre": ')
      .expect(400);
    assert.equal(res.body.error.codigo, 'JSON_INVALIDO');
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/auth/register').send(nuevoUsuario).expect(201);
  });

  it('loguea con credenciales correctas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: nuevoUsuario.email, password: nuevoUsuario.password })
      .expect(200);
    assert.ok(res.body.token);
  });

  it('responde 401 con contraseña incorrecta o email inexistente', async () => {
    for (const credenciales of [
      { email: nuevoUsuario.email, password: 'otra-cosa' },
      { email: 'nadie@ejemplo.test', password: 'secreta123' },
    ]) {
      const res = await request(app).post('/auth/login').send(credenciales).expect(401);
      assert.equal(res.body.error.codigo, 'CREDENCIALES_INVALIDAS');
    }
  });
});

describe('GET /usuarios/me', () => {
  it('requiere token', async () => {
    const res = await request(app).get('/usuarios/me').expect(401);
    assert.equal(res.body.error.codigo, 'TOKEN_REQUERIDO');
  });

  it('rechaza tokens inválidos', async () => {
    const res = await request(app)
      .get('/usuarios/me')
      .set('Authorization', 'Bearer cualquier.cosa.rara')
      .expect(401);
    assert.equal(res.body.error.codigo, 'TOKEN_INVALIDO');
  });

  it('devuelve el usuario del token', async () => {
    const { body } = await request(app).post('/auth/register').send(nuevoUsuario);
    const res = await request(app)
      .get('/usuarios/me')
      .set('Authorization', `Bearer ${body.token}`)
      .expect(200);
    assert.equal(res.body.email, 'lucia@ejemplo.test');
    assert.equal(res.body.passwordHash, undefined);
  });
});

describe('Rutas inexistentes', () => {
  it('responden 404 con el formato de error', async () => {
    const res = await request(app).get('/no-existe').expect(404);
    assert.equal(res.body.error.codigo, 'RUTA_NO_ENCONTRADA');
  });
});
