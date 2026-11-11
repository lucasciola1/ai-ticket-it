import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearAppConSeed } from '../helpers.js';

let ctx;
beforeEach(() => {
  ctx = crearAppConSeed();
});

const tipo = (evento, nombre) => evento.tiposEntrada.find((t) => t.nombre === nombre);

describe('Flujo completo de una compra', () => {
  it('comprar → pagar → chatear → utilizar → reseñar', async () => {
    const juan = await ctx.como('juan');
    const martin = await ctx.como('martin');
    const hamlet = ctx.evento('Hamlet');
    const platea = tipo(hamlet, 'Platea');
    const disponiblesAntes = platea.disponibles();

    // Comprar
    const compra = (
      await juan
        .post('/compras')
        .send({ eventoId: hamlet.id, tipoEntradaId: platea.id, cantidad: 2 })
        .expect(201)
    ).body;
    assert.equal(compra.estado, 'PENDIENTE');
    assert.equal(compra.total, 2 * platea.precio);
    assert.equal(compra.diasParaEvento, null);
    assert.deepEqual(compra.acciones, { pagar: true, cancelar: true, utilizar: false, reseniar: false });
    assert.equal(platea.disponibles(), disponiblesAntes - 2);

    // Pagar
    const pagada = (await juan.post(`/compras/${compra.id}/pagar`).expect(200)).body;
    assert.equal(pagada.estado, 'CONFIRMADA');
    assert.ok(pagada.diasParaEvento >= 9 && pagada.diasParaEvento <= 11);

    // Chat entre comprador y organizador
    await juan.post(`/compras/${compra.id}/mensajes`).send({ texto: '¿Hay estacionamiento?' }).expect(201);
    const respuesta = await martin
      .post(`/compras/${compra.id}/mensajes`)
      .send({ texto: 'Sí, en la esquina.' })
      .expect(201);
    assert.equal(respuesta.body.esDelOrganizador, true);
    const chat = (await juan.get(`/compras/${compra.id}/mensajes`).expect(200)).body;
    assert.deepEqual(chat.map((m) => m.texto), ['¿Hay estacionamiento?', 'Sí, en la esquina.']);

    // El organizador ve la compra y valida la entrada
    const vistaOrg = (await martin.get(`/eventos/${hamlet.id}/compras?estado=CONFIRMADA`).expect(200)).body;
    assert.ok(vistaOrg.compras.some((c) => c.id === compra.id && c.acciones.utilizar));
    const utilizada = (await martin.post(`/compras/${compra.id}/utilizar`).expect(200)).body;
    assert.equal(utilizada.estado, 'UTILIZADA');
    assert.deepEqual(
      utilizada.historial.map((h) => [h.estado, h.quien.nombre]),
      [
        ['PENDIENTE', 'Juan'],
        ['CONFIRMADA', 'Juan'],
        ['UTILIZADA', 'Martín'],
      ],
    );

    // Reseñar (una sola vez)
    await juan.post(`/compras/${compra.id}/resenia`).send({ puntuacion: 5, detalle: 'Genial' }).expect(201);
    const repetida = await juan.post(`/compras/${compra.id}/resenia`).send({ puntuacion: 4 }).expect(409);
    assert.equal(repetida.body.error.codigo, 'RESENIA_EXISTENTE');

    // La reputación de Martín pasa de 3 a 4
    const detalle = (await juan.get(`/eventos/${hamlet.id}`).expect(200)).body;
    assert.equal(detalle.organizador.puntaje, 4);
    assert.equal(detalle.organizador.cantidadResenias, 2);
  });
});

describe('POST /compras', () => {
  it('no permite superar el cupo', async () => {
    const sofia = await ctx.como('sofia');
    const festival = ctx.evento('Festival Sonidos del Río');
    const res = await sofia
      .post('/compras')
      .send({ eventoId: festival.id, tipoEntradaId: tipo(festival, 'VIP').id, cantidad: 2 })
      .expect(409);
    assert.equal(res.body.error.codigo, 'SIN_CUPO');
  });

  it('no permite comprar entradas de un evento pasado', async () => {
    const sofia = await ctx.como('sofia');
    const pasado = ctx.evento('Comedia de Enredos');
    const res = await sofia
      .post('/compras')
      .send({ eventoId: pasado.id, tipoEntradaId: pasado.tiposEntrada[0].id, cantidad: 1 })
      .expect(400);
    assert.equal(res.body.error.codigo, 'EVENTO_FINALIZADO');
  });

  it('no permite comprar entradas del propio evento', async () => {
    const ana = await ctx.como('ana');
    const rock = ctx.evento('Noche de Rock Nacional');
    await ana
      .post('/compras')
      .send({ eventoId: rock.id, tipoEntradaId: rock.tiposEntrada[0].id, cantidad: 1 })
      .expect(403);
  });

  it('valida el body', async () => {
    const sofia = await ctx.como('sofia');
    const res = await sofia.post('/compras').send({ cantidad: 0 }).expect(400);
    assert.equal(res.body.error.detalles.length, 3);
  });
});

describe('Cancelaciones', () => {
  it('cancelar una compra confirmada la reembolsa y libera cupo', async () => {
    const sofia = await ctx.como('sofia');
    const rock = ctx.evento('Noche de Rock Nacional');
    const platea = tipo(rock, 'Platea');
    const antes = platea.disponibles();
    const compra = (await sofia.get('/usuarios/me/compras')).body.find(
      (c) => c.evento.id === rock.id,
    );
    assert.equal(compra.estado, 'CONFIRMADA');

    const cancelada = (await sofia.post(`/compras/${compra.id}/cancelar`).expect(200)).body;
    assert.equal(cancelada.estado, 'REEMBOLSADA');
    assert.equal(platea.disponibles(), antes + compra.cantidad);
  });

  it('no se puede cancelar una compra utilizada', async () => {
    const sofia = await ctx.como('sofia');
    const compra = (await sofia.get('/usuarios/me/compras')).body.find((c) => c.estado === 'UTILIZADA');
    assert.equal(compra.acciones.cancelar, false);
    const res = await sofia.post(`/compras/${compra.id}/cancelar`).expect(409);
    assert.equal(res.body.error.codigo, 'COMPRA_NO_CANCELABLE');
  });

  it('el organizador no puede cancelar por el comprador', async () => {
    const ana = await ctx.como('ana');
    const compra = (await ana.get(`/eventos/${ctx.evento('Noche de Rock Nacional').id}/compras`)).body
      .compras[0];
    const res = await ana.post(`/compras/${compra.id}/cancelar`).expect(403);
    assert.equal(res.body.error.codigo, 'SOLO_COMPRADOR');
  });
});

describe('Permisos', () => {
  it('un tercero no puede ver ni chatear en una compra ajena', async () => {
    const sofia = await ctx.como('sofia');
    const juan = await ctx.como('juan');
    const [compraDeSofia] = (await sofia.get('/usuarios/me/compras')).body;
    await juan.get(`/compras/${compraDeSofia.id}`).expect(403);
    await juan.post(`/compras/${compraDeSofia.id}/mensajes`).send({ texto: 'hola' }).expect(403);
  });

  it('solo el organizador ve las compras del evento', async () => {
    const sofia = await ctx.como('sofia');
    const res = await sofia.get(`/eventos/${ctx.evento('Hamlet').id}/compras`).expect(403);
    assert.equal(res.body.error.codigo, 'SOLO_ORGANIZADOR');
  });

  it('el comprador no puede marcar su entrada como utilizada', async () => {
    const sofia = await ctx.como('sofia');
    const compra = (await sofia.get('/usuarios/me/compras')).body.find((c) => c.estado === 'CONFIRMADA');
    await sofia.post(`/compras/${compra.id}/utilizar`).expect(403);
  });
});

describe('GET /usuarios/me/compras', () => {
  it('muestra cada compra con su estado y los días faltantes si está confirmada', async () => {
    const sofia = await ctx.como('sofia');
    const compras = (await sofia.get('/usuarios/me/compras').expect(200)).body;
    assert.deepEqual(
      compras.map((c) => c.estado).sort(),
      ['CONFIRMADA', 'PENDIENTE', 'REEMBOLSADA', 'UTILIZADA'],
    );
    for (const c of compras) {
      assert.equal(c.diasParaEvento === null, c.estado !== 'CONFIRMADA');
    }
  });

  it('la vista del organizador resume por estado y disponibles por tipo', async () => {
    const ana = await ctx.como('ana');
    const festival = ctx.evento('Festival Sonidos del Río');
    const res = (await ana.get(`/eventos/${festival.id}/compras`).expect(200)).body;
    assert.equal(res.resumenPorEstado.CONFIRMADA, 1);
    assert.equal(res.resumenPorEstado.REEMBOLSADA, 1);
    assert.equal(res.tiposEntrada.find((t) => t.nombre === 'VIP').disponibles, 1);
  });
});
