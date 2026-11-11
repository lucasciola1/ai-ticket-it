export class Usuario {
  constructor({ id, nombre, apellido, email, passwordHash, favoritos = [] }) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.passwordHash = passwordHash;
    this.favoritos = [...favoritos];
  }

  esFavorito(eventoId) {
    return this.favoritos.includes(eventoId);
  }

  agregarFavorito(eventoId) {
    if (!this.esFavorito(eventoId)) {
      this.favoritos.push(eventoId);
    }
  }

  quitarFavorito(eventoId) {
    this.favoritos = this.favoritos.filter((id) => id !== eventoId);
  }
}
