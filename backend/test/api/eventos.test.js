import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearAppConSeed } from '../helpers.js';

let ctx;
beforeEach(() => {
  ctx = crearAppConSeed();
});

const enDias = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();

describe('GET /categorias', () => {
  it('lista las categorías', async () => {
    const res = await request(ctx.app).get('/categorias').expect(200);
    assert.equal(res.body.length, 6);
  });
});

describe('GET /eventos', () => {
  it('oculta los eventos pasados y pagina', async () => {
    const res = await request(ctx.app).get('/eventos?limit=4').expect(200);
    assert.equal(res.body.total, 6);
    assert.equal(res.body.items.length, 4);
    assert.equal(res.body.totalPages, 2);
    assert.ok(res.body.items.every((e) => !e.finalizado));
  });

  it('busca por texto sin importar tildes', async () => {
    const res = await request(ctx.app).get('/eventos?q=basquet').expect(200);
    assert.deepEqual(res.body.items.map((e) => e.nombre), ['Clásico de Básquet']);
  });

  it('filtra por categoría', async () => {
    const teatro = (await request(ctx.app).get('/categorias')).body.find((c) => c.nombre === 'Teatro');
    const res = await request(ctx.app).get(`/eventos?categoriaId=${teatro.id}`).expect(200);
    assert.deepEqual(res.body.items.map((e) => e.nombre), ['Hamlet']);
  });

  it('ordena por precio y por fecha', async () => {
    const porPrecio = (await request(ctx.app).get('/eventos?orden=precio').expect(200)).body.items;
    const precios = porPrecio.map((e) => e.precioMinimo);
    assert.deepEqual(precios, [...precios].sort((a, b) => a - b));

    const porFecha = (await request(ctx.app).get('/eventos?orden=fecha&dir=desc').expect(200)).body.items;
    const fechas = porFecha.map((e) => new Date(e.fecha).getTime());
    assert.deepEqual(fechas, [...fechas].sort((a, b) => b - a));
  });

  it('ordena por puntaje del organizador (mejor primero)', async () => {
    const res = await request(ctx.app).get('/eventos?orden=puntaje').expect(200);
    const puntajes = res.body.items.map((e) => e.organizador.puntaje);
    assert.equal(puntajes[0], 5); // Ana: una reseña de 5
    assert.equal(puntajes.at(-1), 3); // Martín: una reseña de 3
  });

  it('valida los query params con Zod', async () => {
    const res = await request(ctx.app).get('/eventos?orden=nombre&precioMin=500&precioMax=100').expect(400);
    const campos = res.body.error.detalles.map((d) => d.campo);
    assert.ok(campos.includes('orden'));
  });

  it('marca favoritos si viene el token', async () => {
    const sofia = await ctx.como('sofia');
    const res = await sofia.get('/eventos?q=festival').expect(200);
    assert.equal(res.body.items[0].esFavorito, true);
  });
});

describe('GET /eventos/:id', () => {
  it('devuelve el detalle con disponibles por tipo', async () => {
    const festival = ctx.evento('Festival Sonidos del Río');
    const res = await request(ctx.app).get(`/eventos/${festival.id}`).expect(200);
    const vip = res.body.tiposEntrada.find((t) => t.nombre === 'VIP');
    assert.equal(vip.disponibles, 1);
    assert.equal(res.body.organizador.nombre, 'Ana');
  });

  it('responde 404 si no existe', async () => {
    const res = await request(ctx.app).get('/eventos/no-existe').expect(404);
    assert.equal(res.body.error.codigo, 'EVENTO_NO_ENCONTRADO');
  });
});

describe('POST /eventos', () => {
  const datosEvento = (categoriaId) => ({
    nombre: 'Tributo a Queen',
    descripcion: 'Banda tributo',
    categoriaId,
    fecha: enDias(20),
    lugar: 'Teatro Vorterix',
    tiposEntrada: [
      { nombre: 'General', precio: 10000, cupo: 300 },
      { nombre: 'VIP', precio: 30000, cupo: 30 },
    ],
  });

  it('crea el evento con el usuario como organizador', async () => {
    const [categoria] = (await request(ctx.app).get('/categorias')).body;
    const juan = await ctx.como('juan');
    const res = await juan.post('/eventos').send(datosEvento(categoria.id)).expect(201);
    assert.equal(res.body.organizador.nombre, 'Juan');
    assert.equal(res.body.esOrganizador, true);
    assert.equal(res.body.tiposEntrada.length, 2);

    const mios = await juan.get('/usuarios/me/eventos').expect(200);
    assert.deepEqual(mios.body.map((e) => e.nombre), ['Tributo a Queen']);
  });

  it('requiere estar logueado', async () => {
    await request(ctx.app).post('/eventos').send({}).expect(401);
  });

  it('valida fecha futura, tipos de entrada y categoría', async () => {
    const juan = await ctx.como('juan');
    const invalido = {
      ...datosEvento('x'),
      fecha: enDias(-1),
      tiposEntrada: [
        { nombre: 'General', precio: -5, cupo: 0 },
        { nombre: 'general', precio: 100, cupo: 10 },
      ],
    };
    const res = await juan.post('/eventos').send(invalido).expect(400);
    const campos = res.body.error.detalles.map((d) => d.campo);
    for (const campo of ['fecha', 'tiposEntrada.0.precio', 'tiposEntrada.0.cupo', 'tiposEntrada']) {
      assert.ok(campos.includes(campo), `falta error en ${campo}`);
    }

    const sinCategoria = await juan.post('/eventos').send(datosEvento('no-existe')).expect(400);
    assert.equal(sinCategoria.body.error.codigo, 'CATEGORIA_INEXISTENTE');
  });
});

describe('Favoritos', () => {
  it('marca y desmarca favoritos', async () => {
    const juan = await ctx.como('juan');
    const hamlet = ctx.evento('Hamlet');
    await juan.put(`/usuarios/me/favoritos/${hamlet.id}`).expect(200);
    assert.deepEqual((await juan.get('/usuarios/me/favoritos')).body.map((e) => e.nombre), ['Hamlet']);
    await juan.delete(`/usuarios/me/favoritos/${hamlet.id}`).expect(200);
    assert.deepEqual((await juan.get('/usuarios/me/favoritos')).body, []);
  });

  it('no permite marcar un evento inexistente', async () => {
    const juan = await ctx.como('juan');
    await juan.put('/usuarios/me/favoritos/no-existe').expect(404);
  });
});

describe('GET /organizadores/:id/resenias', () => {
  it('devuelve las reseñas de eventos anteriores y el promedio', async () => {
    const ana = ctx.usuario('ana');
    const res = await request(ctx.app).get(`/organizadores/${ana.id}/resenias`).expect(200);
    assert.equal(res.body.promedio, 5);
    assert.equal(res.body.cantidad, 1);
    assert.equal(res.body.resenias[0].evento.nombre, 'Jazz en el Bajo');
    assert.equal(res.body.resenias[0].comprador.nombre, 'Sofía');
  });
});
