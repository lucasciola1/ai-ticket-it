/** Datos de prueba con la forma que devuelven los services (ya adaptados). */

export const organizadora = { id: 'org1', nombre: 'Ana', apellido: 'García', puntaje: 4.5, cantidadResenias: 2 };

export const eventoResumen = (datos = {}) => ({
  id: 'ev1',
  nombre: 'Noche de Rock Nacional',
  fecha: new Date('2030-12-06T21:00:00'),
  lugar: 'Estadio Obras, CABA',
  imagen: null,
  multimedia: [],
  categoria: { id: 'cat1', nombre: 'Recitales' },
  precioMinimo: 25000,
  organizador: organizadora,
  finalizado: false,
  agotado: false,
  esFavorito: false,
  tiposEntrada: [],
  ...datos,
});

export const eventoDetalle = (datos = {}) =>
  eventoResumen({
    descripcion: 'Clásicos del rock argentino.',
    esOrganizador: false,
    tiposEntrada: [
      { id: 't1', nombre: 'General', descripcion: 'Campo', precio: 25000, cupo: 500, vendidas: 0, disponibles: 500, agotado: false },
      { id: 't2', nombre: 'VIP', descripcion: '', precio: 90000, cupo: 20, vendidas: 20, disponibles: 0, agotado: true },
    ],
    ...datos,
  });

export const paginaDeEventos = (eventos) => ({ eventos, total: eventos.length, pagina: 1, totalPaginas: 1 });

export const sofia = { id: 'u1', nombre: 'Sofía', apellido: 'Fernández', email: 'sofia@aiticketit.test', favoritos: [] };

const ACCIONES_COMPRADOR = {
  PENDIENTE: { pagar: true, cancelar: true, utilizar: false, reseniar: false },
  CONFIRMADA: { pagar: false, cancelar: true, utilizar: false, reseniar: false },
  UTILIZADA: { pagar: false, cancelar: false, utilizar: false, reseniar: true },
  CANCELADA: { pagar: false, cancelar: false, utilizar: false, reseniar: false },
  REEMBOLSADA: { pagar: false, cancelar: false, utilizar: false, reseniar: false },
};

/** Compra con la forma del back (ya adaptada), vista por el comprador. */
export const compra = ({ estado = 'PENDIENTE', ...datos } = {}) => ({
  id: `c-${estado}`,
  rol: 'comprador',
  estado,
  cantidad: 2,
  precioUnitario: 40000,
  total: 80000,
  fechaCompra: new Date('2030-11-01T12:00:00'),
  diasParaEvento: estado === 'CONFIRMADA' ? 5 : null,
  evento: {
    id: 'ev1',
    nombre: `Recital ${estado.toLowerCase()}`,
    fecha: new Date('2030-12-06T21:00:00'),
    lugar: 'Estadio Obras, CABA',
    imagen: null,
    organizadorId: 'org1',
    finalizado: estado === 'UTILIZADA',
  },
  tipoEntrada: { id: 't1', nombre: 'Platea' },
  comprador: { id: sofia.id, nombre: sofia.nombre, apellido: sofia.apellido },
  cantidadMensajes: 0,
  resenia: null,
  acciones: ACCIONES_COMPRADOR[estado],
  historial: [{ estado: 'PENDIENTE', fechaHora: new Date('2030-11-01T12:00:00'), quien: sofia }],
  ...datos,
});

export const ana = { id: 'org1', nombre: 'Ana', apellido: 'García', email: 'ana@aiticketit.test', favoritos: [] };

/** Respuesta de GET /eventos/:id/compras (vista del organizador), ya adaptada. */
export const ventasDelEvento = ({ compras = [], resumenPorEstado } = {}) => ({
  evento: { id: 'ev1', nombre: 'Noche de Rock Nacional', fecha: new Date('2030-12-06T21:00:00'), lugar: 'Estadio Obras, CABA' },
  tiposEntrada: [
    { id: 't1', nombre: 'Platea', precio: 40000, cupo: 150, vendidas: 30, disponibles: 120, agotado: false },
    { id: 't2', nombre: 'VIP', precio: 90000, cupo: 20, vendidas: 19, disponibles: 1, agotado: false },
  ],
  resumenPorEstado: resumenPorEstado ?? { PENDIENTE: 1, CONFIRMADA: 2, UTILIZADA: 0, CANCELADA: 0, REEMBOLSADA: 1 },
  compras,
});

export const categorias = [
  { id: 'cat1', nombre: 'Recitales', descripcion: '' },
  { id: 'cat2', nombre: 'Teatro', descripcion: '' },
];
