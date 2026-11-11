import { randomUUID } from 'node:crypto';

export class Mensaje {
  constructor({ id = randomUUID(), autorId, texto, enviado = new Date() }) {
    this.id = id;
    this.autorId = autorId;
    this.texto = texto;
    this.enviado = new Date(enviado);
  }
}
