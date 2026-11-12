/* eslint-env jest */
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import App from '../App';
import * as eventoService from '../src/services/eventoService';
import * as categoriaService from '../src/services/categoriaService';
import { categorias, eventoDetalle, eventoResumen, paginaDeEventos } from '../test-utils/fixtures';

jest.mock('../src/services/authService');
jest.mock('../src/services/eventoService');
jest.mock('../src/services/categoriaService');

beforeEach(() => {
  jest.clearAllMocks();
  categoriaService.obtenerCategorias.mockResolvedValue(categorias);
  eventoService.buscarEventos.mockResolvedValue(
    paginaDeEventos([eventoResumen(), eventoResumen({ id: 'ev2', nombre: 'Hamlet', precioMinimo: 12000 })]),
  );
  eventoService.obtenerEvento.mockResolvedValue(eventoDetalle());
  eventoService.obtenerReseniasDeOrganizador.mockResolvedValue({
    promedio: 4.5,
    cantidad: 1,
    resenias: [
      {
        id: 'r1',
        puntuacion: 5,
        detalle: 'Excelente sonido',
        fecha: new Date(),
        evento: { id: 'ev0', nombre: 'Jazz en el Bajo' },
        comprador: { nombre: 'Sofía', apellido: 'Fernández' },
      },
    ],
  });
});

test('sin sesión se ven los eventos y se puede abrir el detalle con reseñas', async () => {
  const user = userEvent.setup();
  await render(<App />);

  expect(await screen.findByText('Noche de Rock Nacional')).toBeTruthy();
  expect(screen.getByText('Hamlet')).toBeTruthy();

  await user.press(screen.getByText('Noche de Rock Nacional'));

  expect(await screen.findByText('Quedan 500 de 500')).toBeTruthy();
  expect(screen.getByText('Agotado')).toBeTruthy(); // el VIP
  expect(await screen.findByText('Excelente sonido')).toBeTruthy();
});

test('elegir una categoría y un orden vuelve a buscar en el servidor', async () => {
  const user = userEvent.setup();
  await render(<App />);
  await screen.findByText('Noche de Rock Nacional');

  await user.press(screen.getByText('Teatro'));
  await waitFor(() =>
    expect(eventoService.buscarEventos).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoriaId: 'cat2', page: 1 }),
    ),
  );

  await user.press(screen.getByText('Puntaje'));
  await waitFor(() =>
    expect(eventoService.buscarEventos).toHaveBeenLastCalledWith(
      expect.objectContaining({ orden: 'puntaje', dir: 'desc' }),
    ),
  );
});

test('comprar sin sesión abre el login', async () => {
  const user = userEvent.setup();
  await render(<App />);
  await user.press(await screen.findByText('Noche de Rock Nacional'));

  await user.press(await screen.findByText('Comprar entradas'));

  expect(await screen.findByText('Bienvenido de nuevo')).toBeTruthy();
});
