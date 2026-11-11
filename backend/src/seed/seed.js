import bcrypt from 'bcryptjs';
import { Usuario } from '../domain/Usuario.js';
import { Categoria } from '../domain/Categoria.js';
import { Evento } from '../domain/Evento.js';
import { Compra } from '../domain/Compra.js';
import { Resenia } from '../domain/Resenia.js';
import { EstadoCompra } from '../domain/EstadoCompra.js';

/** Contraseña de todos los usuarios de prueba (solo para desarrollo). */
export const SEED_PASSWORD = 'password123';

/** Fechas relativas a hoy, así el seed siempre tiene eventos futuros y pasados. */
const dias = (n, hora = 21) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hora, 0, 0, 0);
  return d;
};

const imagen = (clave) => `https://picsum.photos/seed/${clave}/800/450`;

export function cargarSeed(repos, { saltRounds = 10 } = {}) {
  const {
    usuarioRepository,
    categoriaRepository,
    eventoRepository,
    compraRepository,
    reseniaRepository,
  } = repos;

  // ---------- Usuarios ----------
  const passwordHash = bcrypt.hashSync(SEED_PASSWORD, saltRounds);
  const [ana, martin, sofia, juan] = [
    { nombre: 'Ana', apellido: 'García', email: 'ana@aiticketit.test' },
    { nombre: 'Martín', apellido: 'López', email: 'martin@aiticketit.test' },
    { nombre: 'Sofía', apellido: 'Fernández', email: 'sofia@aiticketit.test' },
    { nombre: 'Juan', apellido: 'Pérez', email: 'juan@aiticketit.test' },
  ].map((datos) => usuarioRepository.save(new Usuario({ ...datos, passwordHash })));

  // ---------- Categorías ----------
  const [recitales, teatro, festivales, conferencias, deportes, standup] = [
    { nombre: 'Recitales', descripcion: 'Shows de música en vivo' },
    { nombre: 'Teatro', descripcion: 'Obras, musicales y danza' },
    { nombre: 'Festivales', descripcion: 'Festivales de varios días' },
    { nombre: 'Conferencias', descripcion: 'Charlas y eventos de tecnología' },
    { nombre: 'Deportes', descripcion: 'Partidos y competencias' },
    { nombre: 'Stand-up', descripcion: 'Comedia en vivo' },
  ].map((datos) => categoriaRepository.save(new Categoria(datos)));

  // ---------- Eventos ----------
  const evento = (datos) => eventoRepository.save(new Evento(datos));

  const rockNacional = evento({
    nombre: 'Noche de Rock Nacional',
    descripcion: 'Un recorrido por los clásicos del rock argentino con banda en vivo.',
    categoriaId: recitales.id,
    fecha: dias(25),
    lugar: 'Estadio Obras, CABA',
    multimedia: [imagen('rock-nacional')],
    organizadorId: ana.id,
    tiposEntrada: [
      { nombre: 'General', descripcion: 'Campo de pie', precio: 25000, cupo: 500 },
      { nombre: 'Platea', descripcion: 'Asiento numerado', precio: 40000, cupo: 150 },
      { nombre: 'VIP', descripcion: 'Acceso preferencial y meet & greet', precio: 90000, cupo: 20 },
    ],
  });

  const hamlet = evento({
    nombre: 'Hamlet',
    descripcion: 'La tragedia de Shakespeare en una puesta contemporánea.',
    categoriaId: teatro.id,
    fecha: dias(10, 20),
    lugar: 'Teatro San Martín, CABA',
    multimedia: [imagen('hamlet')],
    organizadorId: martin.id,
    tiposEntrada: [
      { nombre: 'Platea', precio: 18000, cupo: 200 },
      { nombre: 'Pullman', precio: 12000, cupo: 100 },
    ],
  });

  const festival = evento({
    nombre: 'Festival Sonidos del Río',
    descripcion: 'Dos días de música indie y electrónica frente al río.',
    categoriaId: festivales.id,
    fecha: dias(60, 15),
    lugar: 'Costanera Sur, CABA',
    multimedia: [imagen('festival-rio'), imagen('festival-rio-2')],
    organizadorId: ana.id,
    tiposEntrada: [
      { nombre: 'Abono 1 día', precio: 35000, cupo: 2000 },
      { nombre: 'Abono 2 días', precio: 60000, cupo: 1500 },
      { nombre: 'VIP', precio: 120000, cupo: 4 },
    ],
  });

  const devConf = evento({
    nombre: 'DevConf Buenos Aires',
    descripcion: 'Conferencia de desarrollo de software e inteligencia artificial.',
    categoriaId: conferencias.id,
    fecha: dias(3, 9),
    lugar: 'Centro Costa Salguero, CABA',
    multimedia: [imagen('devconf')],
    organizadorId: martin.id,
    tiposEntrada: [
      { nombre: 'Estudiante', precio: 8000, cupo: 300 },
      { nombre: 'General', precio: 20000, cupo: 500 },
    ],
  });

  const standupNoche = evento({
    nombre: 'Stand-up a la Medianoche',
    descripcion: 'Cuatro comediantes, un micrófono y ninguna censura.',
    categoriaId: standup.id,
    fecha: dias(14, 23),
    lugar: 'Paseo La Plaza, CABA',
    multimedia: [imagen('standup')],
    organizadorId: ana.id,
    tiposEntrada: [{ nombre: 'General', precio: 15000, cupo: 120 }],
  });

  const clasico = evento({
    nombre: 'Clásico de Básquet',
    descripcion: 'Final de la liga regional de básquet.',
    categoriaId: deportes.id,
    fecha: dias(40, 19),
    lugar: 'Estadio Ruca Che, Neuquén',
    multimedia: [imagen('basquet')],
    organizadorId: martin.id,
    tiposEntrada: [
      { nombre: 'Popular', precio: 9000, cupo: 800 },
      { nombre: 'Platea', precio: 16000, cupo: 300 },
    ],
  });

  // Eventos pasados: sus reseñas forman la reputación de cada organizador
  const jazzPasado = evento({
    nombre: 'Jazz en el Bajo',
    descripcion: 'Noche de jazz con cuarteto invitado.',
    categoriaId: recitales.id,
    fecha: dias(-30),
    lugar: 'Usina del Arte, CABA',
    multimedia: [imagen('jazz')],
    organizadorId: ana.id,
    tiposEntrada: [{ nombre: 'General', precio: 12000, cupo: 200 }],
  });

  const comediaPasada = evento({
    nombre: 'Comedia de Enredos',
    descripcion: 'Una comedia clásica de puertas que se abren y se cierran.',
    categoriaId: teatro.id,
    fecha: dias(-15, 20),
    lugar: 'Teatro Maipo, CABA',
    multimedia: [imagen('comedia')],
    organizadorId: martin.id,
    tiposEntrada: [{ nombre: 'Platea', precio: 14000, cupo: 150 }],
  });

  // ---------- Compras (pasan por las transiciones reales del dominio) ----------
  const comprar = ({ comprador, ev, tipo = 0, cantidad, haceDias }) => {
    const tipoEntrada = ev.tiposEntrada[tipo];
    tipoEntrada.reservar(cantidad);
    return new Compra({
      compradorId: comprador.id,
      eventoId: ev.id,
      tipoEntradaId: tipoEntrada.id,
      cantidad,
      precioUnitario: tipoEntrada.precio,
      fechaCompra: dias(-haceDias, 12),
    });
  };
  const guardar = (compra) => compraRepository.save(compra);

  // Sofía: una de cada estado
  const c1 = comprar({ comprador: sofia, ev: rockNacional, tipo: 1, cantidad: 2, haceDias: 5 });
  c1.actualizarEstado(EstadoCompra.CONFIRMADA, sofia.id, dias(-5, 13));
  c1.agregarMensaje(sofia.id, '¡Hola! ¿A qué hora abren las puertas?', dias(-4, 10));
  c1.agregarMensaje(ana.id, 'Hola Sofía, abrimos a las 19 hs. ¡Te esperamos!', dias(-4, 11));
  guardar(c1);

  guardar(comprar({ comprador: sofia, ev: hamlet, cantidad: 1, haceDias: 1 })); // PENDIENTE

  const c3 = comprar({ comprador: sofia, ev: festival, tipo: 1, cantidad: 2, haceDias: 8 });
  c3.actualizarEstado(EstadoCompra.CONFIRMADA, sofia.id, dias(-8, 13));
  c3.cancelar(festival, sofia.id, dias(-6, 10)); // REEMBOLSADA
  guardar(c3);

  const c4 = comprar({ comprador: sofia, ev: jazzPasado, cantidad: 2, haceDias: 40 });
  c4.actualizarEstado(EstadoCompra.CONFIRMADA, sofia.id, dias(-40, 13));
  c4.actualizarEstado(EstadoCompra.UTILIZADA, ana.id, dias(-30, 20));
  guardar(c4);

  // Juan
  const c5 = comprar({ comprador: juan, ev: devConf, tipo: 0, cantidad: 1, haceDias: 10 });
  c5.actualizarEstado(EstadoCompra.CONFIRMADA, juan.id, dias(-10, 13));
  guardar(c5);

  const c6 = comprar({ comprador: juan, ev: standupNoche, cantidad: 3, haceDias: 2 });
  c6.cancelar(standupNoche, juan.id, dias(-1, 9)); // CANCELADA (no estaba paga)
  guardar(c6);

  const c7 = comprar({ comprador: juan, ev: comediaPasada, cantidad: 2, haceDias: 20 });
  c7.actualizarEstado(EstadoCompra.CONFIRMADA, juan.id, dias(-20, 13));
  c7.actualizarEstado(EstadoCompra.UTILIZADA, martin.id, dias(-15, 19));
  guardar(c7);

  const c8 = comprar({ comprador: juan, ev: jazzPasado, cantidad: 1, haceDias: 35 });
  c8.actualizarEstado(EstadoCompra.CONFIRMADA, juan.id, dias(-35, 13));
  c8.actualizarEstado(EstadoCompra.UTILIZADA, ana.id, dias(-30, 20)); // sin reseña todavía
  guardar(c8);

  // VIP del festival casi agotado (para probar el control de cupo)
  const c9 = comprar({ comprador: juan, ev: festival, tipo: 2, cantidad: 3, haceDias: 3 });
  c9.actualizarEstado(EstadoCompra.CONFIRMADA, juan.id, dias(-3, 13));
  guardar(c9);

  // Martín también compra (un usuario puede ser organizador y comprador)
  const c10 = comprar({ comprador: martin, ev: rockNacional, tipo: 2, cantidad: 1, haceDias: 4 });
  c10.actualizarEstado(EstadoCompra.CONFIRMADA, martin.id, dias(-4, 13));
  guardar(c10);

  // Los cupos cambiaron: guardamos los eventos de nuevo
  eventoRepository.findAll().forEach((e) => eventoRepository.save(e));

  // ---------- Reseñas ----------
  reseniaRepository.save(
    Resenia.paraCompra(c4, {
      puntuacion: 5,
      detalle: 'Excelente sonido y muy buena organización. ¡Vuelvo seguro!',
      fecha: dias(-29),
    }),
  );
  reseniaRepository.save(
    Resenia.paraCompra(c7, {
      puntuacion: 3,
      detalle: 'La obra estuvo bien, pero empezó 40 minutos tarde.',
      fecha: dias(-14),
    }),
  );
}
