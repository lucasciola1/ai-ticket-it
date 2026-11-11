/**
 * Errores de la aplicación. Cada uno sabe qué status HTTP le corresponde,
 * así el errorHandler los traduce sin conocer los casos particulares.
 */
export class AppError extends Error {
  constructor(statusCode, codigo, mensaje, detalles = []) {
    super(mensaje);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

export class ValidationError extends AppError {
  constructor(codigo, mensaje, detalles) {
    super(400, codigo, mensaje, detalles);
  }
}

export class UnauthorizedError extends AppError {
  constructor(codigo, mensaje) {
    super(401, codigo, mensaje);
  }
}

export class ForbiddenError extends AppError {
  constructor(codigo, mensaje) {
    super(403, codigo, mensaje);
  }
}

export class NotFoundError extends AppError {
  constructor(codigo, mensaje) {
    super(404, codigo, mensaje);
  }
}

export class ConflictError extends AppError {
  constructor(codigo, mensaje) {
    super(409, codigo, mensaje);
  }
}
