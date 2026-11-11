/**
 * Adapters: traducen las respuestas del back al formato que usa la app.
 * Si el back cambia un campo, se corrige solo acá.
 */

const aFecha = (valor) => (valor ? new Date(valor) : null);

export const aUsuario = (u) => ({
  id: u.id,
  nombre: u.nombre,
  apellido: u.apellido,
  email: u.email,
  favoritos: u.favoritos ?? [],
});

export const aEvento = (e) => ({
  ...e,
  fecha: aFecha(e.fecha),
  imagen: e.imagen ?? null, // sin imagen → la tarjeta muestra un placeholder
  multimedia: e.multimedia ?? (e.imagen ? [e.imagen] : []),
  tiposEntrada: e.tiposEntrada ?? [],
});

export const aResenia = (r) => ({
  ...r,
  fecha: aFecha(r.fecha),
  evento: r.evento ? { ...r.evento, fecha: aFecha(r.evento.fecha) } : undefined,
});

export const aCompra = (c) => ({
  ...c,
  fechaCompra: aFecha(c.fechaCompra),
  evento: { ...c.evento, fecha: aFecha(c.evento.fecha) },
  resenia: c.resenia ? aResenia(c.resenia) : null,
  historial: (c.historial ?? []).map((h) => ({ ...h, fechaHora: aFecha(h.fechaHora) })),
});

export const aMensaje = (m) => ({ ...m, enviado: aFecha(m.enviado) });

/** Inverso: del formulario de evento al body que espera POST /eventos. */
export const aEventoNuevoBody = (form) => ({
  nombre: form.nombre,
  descripcion: form.descripcion,
  categoriaId: form.categoriaId,
  fecha: form.fecha?.toISOString(),
  lugar: form.lugar,
  multimedia: form.multimedia.filter((url) => url.trim() !== ''),
  tiposEntrada: form.tiposEntrada.map((t) => ({
    nombre: t.nombre,
    descripcion: t.descripcion,
    precio: Number(t.precio), // los inputs devuelven strings
    cupo: parseInt(t.cupo, 10),
  })),
});
