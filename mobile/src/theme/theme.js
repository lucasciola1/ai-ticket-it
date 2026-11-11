const colores = {
  primario: '#5B3DF5',
  primarioSuave: '#ECE8FE',
  fondo: '#F6F5FB',
  superficie: '#FFFFFF',
  texto: '#1C1B29',
  textoSecundario: '#6B6880',
  borde: '#E3E1EE',
  error: '#D93A3A',
  errorSuave: '#FDECEC',
  exito: '#1E9E5A',
  estrella: '#F5A623',
  blanco: '#FFFFFF',
};

/** Colores y etiqueta de cada estado de compra (los usa ChipEstado). */
const estados = {
  PENDIENTE: { etiqueta: 'Pendiente de pago', fondo: '#FFF4D6', texto: '#8A5D00' },
  CONFIRMADA: { etiqueta: 'Confirmada', fondo: '#E1F5EA', texto: '#17794A' },
  UTILIZADA: { etiqueta: 'Utilizada', fondo: '#E6EEFB', texto: '#2D5DAA' },
  CANCELADA: { etiqueta: 'Cancelada', fondo: '#EFEFF3', texto: '#5E5C6B' },
  REEMBOLSADA: { etiqueta: 'Reembolsada', fondo: '#F6E8FB', texto: '#7E3C99' },
};

const botones = {
  primario: { fondo: colores.primario, texto: colores.blanco, borde: colores.primario },
  secundario: { fondo: 'transparent', texto: colores.primario, borde: colores.primario },
  peligro: { fondo: colores.error, texto: colores.blanco, borde: colores.error },
};

export const theme = {
  colores,
  estados,
  botones,
  espacio: { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 },
  radio: { s: 8, m: 12, l: 20 },
  fuente: { chica: 13, normal: 15, grande: 18, titulo: 24 },
};
