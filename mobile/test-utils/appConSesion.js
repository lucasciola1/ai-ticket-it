/* eslint-env jest */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render } from '@testing-library/react-native';
import App from '../App';
import * as authService from '../src/services/authService';
import * as eventoService from '../src/services/eventoService';
import * as categoriaService from '../src/services/categoriaService';
import { categorias, paginaDeEventos, sofia } from './fixtures';

/**
 * Renderiza la app con una sesión ya guardada (como si el usuario hubiera iniciado sesión antes).
 * Requiere que el test haga jest.mock de authService, eventoService y categoriaService.
 */
export async function renderAppConSesion(usuario = sofia) {
  await AsyncStorage.setItem('aiticketit.token', 'token-de-prueba');
  authService.obtenerUsuarioActual.mockResolvedValue(usuario);
  eventoService.buscarEventos.mockResolvedValue(paginaDeEventos([]));
  eventoService.obtenerFavoritos.mockResolvedValue([]);
  categoriaService.obtenerCategorias.mockResolvedValue(categorias);
  return render(<App />);
}
