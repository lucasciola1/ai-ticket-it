const precio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export const formatearPrecio = (valor) => precio.format(valor);

/** "sáb 15 nov · 21:00" */
export const formatearFecha = (fecha) => {
  const dia = fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  const hora = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} · ${hora}`;
};

/** "Faltan 3 días" / "Es mañana" / "Es hoy" */
export const textoDiasFaltantes = (dias) => {
  if (dias === 0) return 'Es hoy';
  if (dias === 1) return 'Es mañana';
  return `Faltan ${dias} días`;
};
