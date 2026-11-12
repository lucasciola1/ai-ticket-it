/* eslint-env jest */
import AsyncStorage from '@react-native-async-storage/async-storage';
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

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.removeItem('aiticketit.token');
  eventoService.buscarEventos.mockResolvedValue(paginaDeEventos([]));
  eventoService.obtenerFavoritos.mockResolvedValue([]);
  categoriaService.obtenerCategorias.mockResolvedValue(categorias);
});

test('al reabrir la app recupera la sesión guardada', async () => {
  await AsyncStorage.setItem('aiticketit.token', 'token-guardado');
  authService.obtenerUsuarioActual.mockResolvedValue(sofia);
  const user = userEvent.setup();
  await render(<App />);

  await user.press(await screen.findByText('Perfil'));
  expect(await screen.findByText('Sofía Fernández')).toBeTruthy();
  expect(authService.obtenerUsuarioActual).toHaveBeenCalledTimes(1);
});

test('si el token ya no sirve (ej. se reinició el back), entra sin sesión y lo borra', async () => {
  await AsyncStorage.setItem('aiticketit.token', 'token-viejo');
  authService.obtenerUsuarioActual.mockRejectedValue({ response: { status: 401 } });
  const user = userEvent.setup();
  await render(<App />);

  await user.press(await screen.findByText('Perfil'));
  expect(await screen.findByText('Tu perfil')).toBeTruthy();
  expect(await AsyncStorage.getItem('aiticketit.token')).toBeNull();
});
