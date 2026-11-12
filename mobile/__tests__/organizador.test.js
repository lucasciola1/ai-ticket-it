/* eslint-env jest */
import { Alert } from 'react-native';
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import * as eventoService from '../src/services/eventoService';
import * as compraService from '../src/services/compraService';
import { ana, compra, eventoDetalle, eventoResumen, ventasDelEvento } from '../test-utils/fixtures';
import { renderAppConSesion } from '../test-utils/appConSesion';

jest.mock('../src/services/authService');
jest.mock('../src/services/eventoService');
jest.mock('../src/services/categoriaService');
jest.mock('../src/services/compraService');

const compraVistaPorOrganizador = (estado) =>
  compra({
    estado,
    rol: 'organizador',
    acciones: { pagar: false, cancelar: false, utilizar: estado === 'CONFIRMADA', reseniar: false },
  });

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation((titulo, mensaje, botones) => {
    botones?.find((b) => b.text === 'Confirmar')?.onPress?.();
  });
  eventoService.obtenerMisEventos.mockResolvedValue([eventoResumen()]);
  compraService.obtenerComprasDelEvento.mockResolvedValue(
    ventasDelEvento({ compras: [compraVistaPorOrganizador('CONFIRMADA')] }),
  );
});

const abrirVentas = async (user) => {
  await user.press(await screen.findByText('Mis eventos'));
  await user.press(await screen.findByLabelText('Noche de Rock Nacional'));
  await screen.findByText('Entradas disponibles');
};

test('ve las ventas de su evento: disponibles por tipo y compras por estado', async () => {
  const user = userEvent.setup();
  await renderAppConSesion(ana);
  await abrirVentas(user);

  expect(screen.getByText('19 de 20 vendidas')).toBeTruthy();
  expect(screen.getByText('Quedan 1')).toBeTruthy();
  expect(screen.getByText('Todas · 4')).toBeTruthy();
  expect(screen.getByText('Sofía Fernández')).toBeTruthy(); // el comprador

  await user.press(screen.getByText('Confirmada · 2'));
  await waitFor(() => expect(compraService.obtenerComprasDelEvento).toHaveBeenLastCalledWith('ev1', 'CONFIRMADA'));
});

test('valida la entrada de una compra confirmada', async () => {
  compraService.obtenerCompra.mockResolvedValue(compraVistaPorOrganizador('CONFIRMADA'));
  compraService.marcarUtilizada.mockResolvedValue(compraVistaPorOrganizador('UTILIZADA'));
  const user = userEvent.setup();
  await renderAppConSesion(ana);
  await abrirVentas(user);

  await user.press(screen.getByLabelText('Compra de Recital confirmada'));
  expect(await screen.findByText('Comprador: Sofía Fernández')).toBeTruthy();
  expect(screen.queryByText('Cancelar compra')).toBeNull(); // cancelar es solo del comprador

  await user.press(screen.getByText('Marcar entrada como utilizada'));

  expect(compraService.marcarUtilizada).toHaveBeenCalledWith('c-CONFIRMADA');
  expect(await screen.findByText('Utilizada')).toBeTruthy();
});

test('crea un evento con varios tipos de entrada y fecha elegida en el calendario', async () => {
  eventoService.crearEvento
    .mockRejectedValueOnce({
      response: {
        data: {
          error: {
            codigo: 'VALIDACION',
            mensaje: 'Hay datos inválidos en la solicitud',
            detalles: [{ campo: 'tiposEntrada.1.precio', mensaje: 'El precio tiene que ser un número' }],
          },
        },
      },
    })
    .mockResolvedValueOnce({ id: 'nuevo' });
  eventoService.obtenerEvento.mockResolvedValue(eventoDetalle({ id: 'nuevo', nombre: 'Noche de Jazz', esOrganizador: true }));
  eventoService.obtenerReseniasDeOrganizador.mockResolvedValue({ promedio: null, cantidad: 0, resenias: [] });

  const user = userEvent.setup();
  await renderAppConSesion(ana);
  await user.press(await screen.findByText('Mis eventos'));
  await user.press(await screen.findByText('Crear evento'));

  await user.type(await screen.findByLabelText('Nombre del evento'), 'Noche de Jazz');
  await user.press(screen.getAllByText('Teatro').at(-1));
  await user.press(screen.getByLabelText('Elegir fecha y hora'));
  await user.type(screen.getByLabelText('Lugar'), 'Usina del Arte');
  await user.type(screen.getByLabelText('Precio del tipo 1'), '15000');
  await user.type(screen.getByLabelText('Cupo del tipo 1'), '200');
  await user.press(screen.getByText('+ Agregar tipo de entrada'));
  await user.type(screen.getByLabelText('Nombre del tipo 2'), 'VIP');
  await user.type(screen.getByLabelText('Cupo del tipo 2'), '20');

  // Primer intento: el back marca el precio faltante del tipo 2, debajo de ese campo
  await user.press(screen.getByText('Publicar evento'));
  expect(await screen.findByText('El precio tiene que ser un número')).toBeTruthy();

  const formEnviado = eventoService.crearEvento.mock.calls[0][0];
  expect(formEnviado).toMatchObject({ nombre: 'Noche de Jazz', categoriaId: 'cat2', lugar: 'Usina del Arte' });
  expect(formEnviado.fecha).toEqual(new Date(2030, 11, 24, 21, 30));
  expect(formEnviado.tiposEntrada).toEqual([
    { nombre: 'General', descripcion: '', precio: '15000', cupo: '200' },
    { nombre: 'VIP', descripcion: '', precio: '', cupo: '20' },
  ]);

  // Segundo intento: se publica y se abre el evento creado
  await user.type(screen.getByLabelText('Precio del tipo 2'), '40000');
  await user.press(screen.getByText('Publicar evento'));
  expect(await screen.findByText('Noche de Jazz')).toBeTruthy();
  expect(screen.getByText('Ver ventas')).toBeTruthy();
});
