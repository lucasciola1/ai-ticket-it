import { randomUUID } from 'node:crypto';

/**
 * Persistencia en memoria sobre un Map. Los repositorios concretos
 * heredan de acá y agregan sus consultas propias.
 */
export class InMemoryRepository {
  #items = new Map();

  findAll() {
    return [...this.#items.values()];
  }

  findById(id) {
    return this.#items.get(id) ?? null;
  }

  findMany(predicado) {
    return this.findAll().filter(predicado);
  }

  findOne(predicado) {
    return this.findAll().find(predicado) ?? null;
  }

  /** Inserta o actualiza. Si la entidad no tiene id, le asigna uno. */
  save(entidad) {
    if (!entidad.id) {
      entidad.id = randomUUID();
    }
    this.#items.set(entidad.id, entidad);
    return entidad;
  }

  delete(id) {
    return this.#items.delete(id);
  }

  clear() {
    this.#items.clear();
  }
}
