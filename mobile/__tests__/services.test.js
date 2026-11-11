/* eslint-env jest */
import { erroresPorCampo, mensajeError } from '../src/services/api';
import { aCompra, aEventoNuevoBody } from '../src/services/adapters';

const errorDelBack = (error) => ({ response: { data: { error } } });

describe('mensajeError', () => {
  it('usa el mensaje que manda el back', () => {
    expect(mensajeError(errorDelBack({ mensaje: 'No hay cupo suficiente' }))).toBe('No hay cupo suficiente');
  });

  it('si no hubo respuesta, avisa que no hay conexión', () => {
    expect(mensajeError(new Error('Network Error'))).toBe('No pudimos conectarnos al servidor');
  });
});

describe('erroresPorCampo', () => {
  it('convierte los detalles de Zod en { campo: mensaje } quedándose con el primero', () => {
    const error = errorDelBack({
      detalles: [
        { campo: 'email', mensaje: 'El email no es válido' },
        { campo: 'password', mensaje: 'Mínimo 8 caracteres' },
        { campo: 'email', mensaje: 'otro error del email' },
      ],
    });
    expect(erroresPorCampo(error)).toEqual({
      email: 'El email no es válido',
      password: 'Mínimo 8 caracteres',
    });
  });

  it('devuelve vacío si no hay detalles', () => {
    expect(erroresPorCampo(new Error('x'))).toEqual({});
  });
});

describe('adapters', () => {
  it('aCompra convierte las fechas a Date', () => {
    const compra = aCompra({
      id: 'c1',
      fechaCompra: '2026-11-01T12:00:00.000Z',
      evento: { id: 'e1', fecha: '2026-12-01T21:00:00.000Z' },
      historial: [{ estado: 'PENDIENTE', fechaHora: '2026-11-01T12:00:00.000Z' }],
      resenia: null,
    });
    expect(compra.fechaCompra).toBeInstanceOf(Date);
    expect(compra.evento.fecha).toBeInstanceOf(Date);
    expect(compra.historial[0].fechaHora).toBeInstanceOf(Date);
  });

  it('aEventoNuevoBody parsea los números de los inputs y descarta URLs vacías', () => {
    const fecha = new Date('2026-12-24T21:00:00.000Z');
    const body = aEventoNuevoBody({
      nombre: 'Recital',
      descripcion: '',
      categoriaId: 'cat',
      fecha,
      lugar: 'Obras',
      multimedia: ['https://imagen.test/a.jpg', '  '],
      tiposEntrada: [{ nombre: 'General', descripcion: '', precio: '1500.5', cupo: '100' }],
    });
    expect(body.fecha).toBe('2026-12-24T21:00:00.000Z');
    expect(body.multimedia).toEqual(['https://imagen.test/a.jpg']);
    expect(body.tiposEntrada[0]).toEqual({ nombre: 'General', descripcion: '', precio: 1500.5, cupo: 100 });
  });
});
