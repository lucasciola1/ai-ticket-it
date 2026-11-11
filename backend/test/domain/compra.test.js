import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Evento } from '../../src/domain/Evento.js';
import { Compra } from '../../src/domain/Compra.js';
import { Resenia } from '../../src/domain/Resenia.js';
import { EstadoCompra } from '../../src/domain/EstadoCompra.js';
import { ConflictError, ValidationError } from '../../src/domain/errors.js';

const enDias = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const crearEvento = (fecha = enDias(10)) =>
  new Evento({
    id: 'ev1',
    nombre: 'Recital',
    fecha,
    organizadorId: 'org',
    tiposEntrada: [
      { id: 'gral', nombre: 'General', precio: 1000, cupo: 10 },
      { id: 'vip', nombre: 'VIP', precio: 5000, cupo: 2 },
    ],
  });

const crearCompra = (evento, cantidad = 2) => {
  const tipo = evento.buscarTipoEntrada('gral');
  tipo.reservar(cantidad);
  return new Compra({
    id: 'c1',
    compradorId: 'comp',
    eventoId: evento.id,
    tipoEntradaId: tipo.id,
    cantidad,
    precioUnitario: tipo.precio,
  });
};

describe('TipoEntrada', () => {
  it('reserva y libera cupo', () => {
    const tipo = crearEvento().buscarTipoEntrada('vip');
    tipo.reservar(2);
    assert.equal(tipo.disponibles(), 0);
    assert.equal(tipo.hayCupoPara(1), false);
    tipo.liberar(1);
    assert.equal(tipo.disponibles(), 1);
  });

  it('no permite superar el cupo', () => {
    const tipo = crearEvento().buscarTipoEntrada('vip');
    assert.throws(() => tipo.reservar(3), (e) => e instanceof ConflictError && e.codigo === 'SIN_CUPO');
  });
});

describe('Evento', () => {
  it('calcula precio mínimo y filtra por rango', () => {
    const evento = crearEvento();
    assert.equal(evento.precioMinimo(), 1000);
    assert.equal(evento.tuPrecioEstaEntre(4000, 6000), true);
    assert.equal(evento.tuPrecioEstaEntre(2000, 4000), false);
  });

  it('busca texto sin importar mayúsculas ni tildes', () => {
    const evento = new Evento({ ...crearEvento(), nombre: 'Música en el Teátro', tiposEntrada: [] });
    assert.equal(evento.coincideCon('teatro'), true);
    assert.equal(evento.coincideCon('MUSICA'), true);
  });
});

describe('Compra', () => {
  it('arranca PENDIENTE con historial y calcula el total', () => {
    const compra = crearCompra(crearEvento());
    assert.equal(compra.estado, EstadoCompra.PENDIENTE);
    assert.equal(compra.historial.length, 1);
    assert.equal(compra.total, 2000);
  });

  it('sigue las transiciones válidas y registra quién cambió el estado', () => {
    const compra = crearCompra(crearEvento());
    compra.actualizarEstado(EstadoCompra.CONFIRMADA, 'comp');
    compra.actualizarEstado(EstadoCompra.UTILIZADA, 'org');
    assert.deepEqual(
      compra.historial.map((c) => [c.estado, c.quienId]),
      [
        ['PENDIENTE', 'comp'],
        ['CONFIRMADA', 'comp'],
        ['UTILIZADA', 'org'],
      ],
    );
  });

  it('rechaza transiciones inválidas', () => {
    const compra = crearCompra(crearEvento());
    assert.throws(
      () => compra.actualizarEstado(EstadoCompra.UTILIZADA, 'org'),
      (e) => e.codigo === 'TRANSICION_INVALIDA',
    );
  });

  it('cancelar una PENDIENTE la deja CANCELADA y libera cupo', () => {
    const evento = crearEvento();
    const compra = crearCompra(evento, 3);
    compra.cancelar(evento, 'comp');
    assert.equal(compra.estado, EstadoCompra.CANCELADA);
    assert.equal(evento.buscarTipoEntrada('gral').disponibles(), 10);
  });

  it('cancelar una CONFIRMADA la deja REEMBOLSADA', () => {
    const evento = crearEvento();
    const compra = crearCompra(evento);
    compra.actualizarEstado(EstadoCompra.CONFIRMADA, 'comp');
    compra.cancelar(evento, 'comp');
    assert.equal(compra.estado, EstadoCompra.REEMBOLSADA);
  });

  it('no se puede cancelar si fue utilizada', () => {
    const evento = crearEvento();
    const compra = crearCompra(evento);
    compra.actualizarEstado(EstadoCompra.CONFIRMADA, 'comp');
    compra.actualizarEstado(EstadoCompra.UTILIZADA, 'org');
    assert.throws(() => compra.cancelar(evento, 'comp'), (e) => e.codigo === 'COMPRA_NO_CANCELABLE');
  });

  it('no se puede cancelar si el evento ya ocurrió', () => {
    const evento = crearEvento(enDias(-1));
    const compra = crearCompra(evento);
    assert.equal(compra.puedeCancelarse(evento), false);
    assert.throws(() => compra.cancelar(evento, 'comp'), /ya se realizó/);
  });

  it('calcula los días de calendario que faltan para el evento', () => {
    const evento = crearEvento(enDias(5));
    assert.equal(crearCompra(evento).diasParaEvento(evento), 5);

    // Evento mañana a las 9, ahora son las 23: falta 1 día aunque sean 10 horas
    const manana = crearEvento(new Date(2030, 0, 2, 9));
    assert.equal(crearCompra(manana).diasParaEvento(manana, new Date(2030, 0, 1, 23)), 1);
    // Mismo día
    assert.equal(crearCompra(manana).diasParaEvento(manana, new Date(2030, 0, 2, 8)), 0);
  });
});

describe('Resenia', () => {
  it('solo se puede reseñar una compra UTILIZADA', () => {
    const compra = crearCompra(crearEvento());
    assert.throws(
      () => Resenia.paraCompra(compra, { puntuacion: 5 }),
      (e) => e.codigo === 'COMPRA_NO_UTILIZADA',
    );
    compra.actualizarEstado(EstadoCompra.CONFIRMADA, 'comp');
    compra.actualizarEstado(EstadoCompra.UTILIZADA, 'org');
    const resenia = Resenia.paraCompra(compra, { puntuacion: 4, detalle: 'Muy bueno' });
    assert.equal(resenia.compraId, 'c1');
  });

  it('la puntuación debe ser un entero de 1 a 5', () => {
    for (const puntuacion of [0, 6, 3.5]) {
      assert.throws(() => new Resenia({ puntuacion }), ValidationError);
    }
  });
});
