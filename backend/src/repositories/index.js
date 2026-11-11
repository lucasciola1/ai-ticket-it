import { InMemoryRepository } from './InMemoryRepository.js';

export class UsuarioRepository extends InMemoryRepository {
  findByEmail(email) {
    const buscado = email.trim().toLowerCase();
    return this.findOne((u) => u.email.toLowerCase() === buscado);
  }
}

export class CategoriaRepository extends InMemoryRepository {}

export class EventoRepository extends InMemoryRepository {
  findByOrganizador(organizadorId) {
    return this.findMany((e) => e.organizadorId === organizadorId);
  }
}

export class CompraRepository extends InMemoryRepository {
  findByComprador(compradorId) {
    return this.findMany((c) => c.compradorId === compradorId);
  }

  findByEvento(eventoId) {
    return this.findMany((c) => c.eventoId === eventoId);
  }
}

export class ReseniaRepository extends InMemoryRepository {
  findByCompra(compraId) {
    return this.findOne((r) => r.compraId === compraId);
  }

  findByEventos(eventoIds) {
    const ids = new Set(eventoIds);
    return this.findMany((r) => ids.has(r.eventoId));
  }
}
