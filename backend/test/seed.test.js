import { it } from 'node:test';
import assert from 'node:assert/strict';
import { createContainer } from '../src/container.js';
import { cargarSeed } from '../src/seed/seed.js';
import { EstadoCompra } from '../src/domain/EstadoCompra.js';

it('el seed carga datos consistentes y con todos los estados de compra', () => {
  const { repositories } = createContainer({ jwtSecret: 'x', bcryptSaltRounds: 4 });
  cargarSeed(repositories, { saltRounds: 4 });

  assert.equal(repositories.usuarioRepository.findAll().length, 4);
  const estados = new Set(repositories.compraRepository.findAll().map((c) => c.estado));
  assert.deepEqual([...estados].sort(), Object.values(EstadoCompra).sort());

  // Las entradas vendidas de cada tipo coinciden con las compras que ocupan cupo
  const ocupan = [EstadoCompra.PENDIENTE, EstadoCompra.CONFIRMADA, EstadoCompra.UTILIZADA];
  for (const evento of repositories.eventoRepository.findAll()) {
    for (const tipo of evento.tiposEntrada) {
      const vendidas = repositories.compraRepository
        .findByEvento(evento.id)
        .filter((c) => c.tipoEntradaId === tipo.id && ocupan.includes(c.estado))
        .reduce((total, c) => total + c.cantidad, 0);
      assert.equal(tipo.vendidas, vendidas, `${evento.nombre} / ${tipo.nombre}`);
    }
  }
});
