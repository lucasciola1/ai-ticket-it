/* eslint-env jest */
import { render, screen, userEvent } from '@testing-library/react-native';
import App from '../App';
import * as authService from '../src/services/authService';
import * as eventoService from '../src/services/eventoService';
import * as categoriaService from '../src/services/categoriaService';
import { categorias, paginaDeEventos } from '../test-utils/fixtures';

jest.mock('../src/services/authService');
jest.mock('../src/services/eventoService');
jest.mock('../src/services/categoriaService');

const sofia = { id: 'u1', nombre: 'Sofía', apellido: 'Fernández', email: 'sofia@aiticketit.test', favoritos: [] };

beforeEach(() => {
  jest.clearAllMocks();
  eventoService.buscarEventos.mockResolvedValue(paginaDeEventos([]));
  eventoService.obtenerFavoritos.mockResolvedValue([]);
  categoriaService.obtenerCategorias.mockResolvedValue(categorias);
});

test('sin sesión se puede navegar y las pestañas privadas piden iniciar sesión', async () => {
  const user = userEvent.setup();
  await render(<App />);

  await user.press(await screen.findByText('Mis compras'));
  expect(await screen.findByText('Iniciá sesión para ver tus compras y cuántos días faltan para cada evento.')).toBeTruthy();
});

test('iniciar sesión desde Perfil vuelve al perfil con los datos del usuario', async () => {
  authService.login.mockResolvedValue({ token: 'token-de-prueba', usuario: sofia });
  const user = userEvent.setup();
  await render(<App />);

  await user.press(await screen.findByText('Perfil'));
  await user.press(await screen.findByText('Iniciar sesión'));

  await user.type(await screen.findByLabelText('Email'), 'sofia@aiticketit.test');
  await user.type(screen.getByLabelText('Contraseña'), 'password123');
  await user.press(screen.getByText('Ingresar'));

  expect(authService.login).toHaveBeenCalledWith('sofia@aiticketit.test', 'password123');
  expect(await screen.findByText('Sofía Fernández')).toBeTruthy();
  expect(screen.getByText('Cerrar sesión')).toBeTruthy();
});

test('muestra debajo de cada campo los errores de validación del back', async () => {
  authService.registrar.mockRejectedValue({
    response: {
      data: {
        error: {
          codigo: 'VALIDACION',
          mensaje: 'Hay datos inválidos en la solicitud',
          detalles: [{ campo: 'password', mensaje: 'La contraseña debe tener al menos 8 caracteres' }],
        },
      },
    },
  });
  const user = userEvent.setup();
  await render(<App />);

  await user.press(await screen.findByText('Perfil'));
  await user.press(await screen.findByText('Crear cuenta'));
  await user.press(await screen.findByRole('button', { name: 'Crear cuenta' }));

  expect(await screen.findByText('La contraseña debe tener al menos 8 caracteres')).toBeTruthy();
  expect(screen.getByText('Hay datos inválidos en la solicitud')).toBeTruthy();
});
