export class CategoriaService {
  constructor({ categoriaRepository }) {
    this.categoriaRepository = categoriaRepository;
  }

  listar() {
    return this.categoriaRepository
      .findAll()
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map(({ id, nombre, descripcion }) => ({ id, nombre, descripcion }));
  }
}
