/* eslint-env jest */
import { Alert } from 'react-native';
import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import * as compraService from '../src/services/compraService';
import { compra } from '../test-utils/fixtures';
import { renderAppConSesion } from '../test-utils/appConSesion';

jest.mock('../src/services/authService');
jest.mock('../src/services/eventoService');
jest.mock('../src/services/categoriaService');
jest.mock('../src/services/compraService');

const errorDelBack = (codigo, mensaje, detalles = []) => ({
  response: { data: { error: { codigo, mensaje, detalles } } },
});

let alertas;
beforeEach(() => {
  jest.clearAllMocks();
  alertas = [];
  // Simula que el usuario toca "Confirmar" en cada diálogo
  jest.spyOn(Alert, 'alert').mockImplementation((titulo, mensaje, botones) => {
    alertas.push({ titulo, mensaje });
    botones?.find((b) => b.text === 'Confirmar')?.onPress?.();
  });
  compraService.obtenerMisCompras.mockResolvedValue([
    compra({ estado: 'PENDIENTE' }),
    compra({ estado: 'CONFIRMADA' }),
    compra({ estado: 'UTILIZADA' }),
    compra({ estado: 'REEMBOLSADA' }),
  ]);
});

/** Abre Mis compras y entra al detalle de la compra en ese estado. */
const abrirCompra = async (user, estado) => {
  compraService.obtenerCompra.mockResolvedValue(compra({ estado }));
  await user.press(await screen.findByText('Mis compras'));
  await user.press(await screen.findByLabelText(`Compra de Recital ${estado.toLowerCase()}`));
  await screen.findByText('Historial');
};

describe('Mis compras', () => {
  test('diferencia cada estado y muestra los días que faltan si está confirmada', async () => {
    const user = userEvent.setup();
    await renderAppConSesion();
    await user.press(await screen.findByText('Mis compras'));

    expect(await screen.findByText('Pendiente de pago')).toBeTruthy();
    expect(screen.getByText('Confirmada')).toBeTruthy();
    expect(screen.getByText('Utilizada')).toBeTruthy();
    expect(screen.getByText('Reembolsada')).toBeTruthy();
    expect(screen.getByText('Faltan 5 días')).toBeTruthy();
    expect(screen.getByText('Falta pagar')).toBeTruthy();
  });

  test('filtra por estado', async () => {
    const user = userEvent.setup();
    await renderAppConSesion();
    await user.press(await screen.findByText('Mis compras'));
    await screen.findByText('Recital pendiente');

    await user.press(screen.getByText('Canceladas'));

    expect(screen.getByText('Recital reembolsada')).toBeTruthy();
    expect(screen.queryByText('Recital pendiente')).toBeNull();
  });
});

describe('Detalle de compra', () => {
  test('pagar pide confirmación y pasa la compra a confirmada', async () => {
    compraService.pagarCompra.mockResolvedValue(compra({ estado: 'CONFIRMADA' }));
    const user = userEvent.setup();
    await renderAppConSesion();
    await abrirCompra(user, 'PENDIENTE');

    await user.press(screen.getByText('Pagar $ 80.000'));

    expect(alertas[0].titulo).toBe('Confirmar pago');
    expect(compraService.pagarCompra).toHaveBeenCalledWith('c-PENDIENTE');
    expect(await screen.findByText('Faltan 5 días')).toBeTruthy();
    expect(screen.queryByText('Pagar $ 80.000')).toBeNull();
  });

  test('cancelar una compra confirmada avisa del reembolso', async () => {
    compraService.cancelarCompra.mockResolvedValue(compra({ estado: 'REEMBOLSADA' }));
    const user = userEvent.setup();
    await renderAppConSesion();
    await abrirCompra(user, 'CONFIRMADA');

    await user.press(screen.getByText('Cancelar compra'));

    // Intl separa "$" del número con un espacio no separable: se compara con \s
    expect(alertas[0].mensaje).toMatch(/^Se cancela la compra y se te reembolsan \$\s80\.000\.$/);
    expect(await screen.findByText('Reembolsada')).toBeTruthy();
  });

  test('si el back rechaza la acción, muestra su mensaje', async () => {
    compraService.cancelarCompra.mockRejectedValue(
      errorDelBack('COMPRA_NO_CANCELABLE', 'El evento ya se realizó'),
    );
    const user = userEvent.setup();
    await renderAppConSesion();
    await abrirCompra(user, 'CONFIRMADA');

    await user.press(screen.getByText('Cancelar compra'));

    await waitFor(() => expect(alertas.at(-1)).toEqual({ titulo: 'No se pudo completar', mensaje: 'El evento ya se realizó' }));
  });

  test('una compra utilizada se puede calificar; los errores del back aparecen por campo', async () => {
    compraService.reseniarCompra
      .mockRejectedValueOnce(
        errorDelBack('VALIDACION', 'Hay datos inválidos en la solicitud', [
          { campo: 'puntuacion', mensaje: 'La puntuación mínima es 1' },
        ]),
      )
      .mockResolvedValueOnce({ id: 'r1', puntuacion: 4, detalle: 'Muy bueno' });
    const user = userEvent.setup();
    await renderAppConSesion();
    await abrirCompra(user, 'UTILIZADA');

    await user.press(screen.getByText('Calificar el evento'));
    await user.press(await screen.findByText('Publicar reseña'));
    expect(await screen.findByText('La puntuación mínima es 1')).toBeTruthy();

    await user.press(screen.getByLabelText('4 estrellas'));
    await user.type(screen.getByLabelText('Comentario (opcional)'), 'Muy bueno');
    await user.press(screen.getByText('Publicar reseña'));

    expect(compraService.reseniarCompra).toHaveBeenLastCalledWith('c-UTILIZADA', { puntuacion: 4, detalle: 'Muy bueno' });
    expect(await screen.findByText('Historial')).toBeTruthy(); // volvió al detalle
  });
});

describe('Chat de la compra', () => {
  const mensaje = (id, texto, autor, esDelOrganizador = false) => ({
    id,
    texto,
    enviado: new Date('2030-11-02T10:00:00'),
    autor,
    esDelOrganizador,
  });
  const ana = { id: 'org1', nombre: 'Ana', apellido: 'García' };
  const sofiaAutor = { id: 'u1', nombre: 'Sofía', apellido: 'Fernández' };

  test('muestra la conversación y envía mensajes', async () => {
    compraService.obtenerMensajes.mockResolvedValue([mensaje('m1', '¿A qué hora abren?', sofiaAutor)]);
    compraService.enviarMensaje.mockResolvedValue(mensaje('m2', '¿Hay guardarropa?', sofiaAutor));
    const user = userEvent.setup();
    await renderAppConSesion();
    await abrirCompra(user, 'CONFIRMADA');

    await user.press(screen.getByText('Mensajes'));
    expect(await screen.findByText('¿A qué hora abren?')).toBeTruthy();

    await user.type(screen.getByLabelText('Mensaje'), '¿Hay guardarropa?');
    await user.press(screen.getByLabelText('Enviar mensaje'));

    expect(compraService.enviarMensaje).toHaveBeenCalledWith('c-CONFIRMADA', '¿Hay guardarropa?');
    expect(await screen.findByText('¿Hay guardarropa?')).toBeTruthy();
  });

  test('consulta mensajes nuevos cada 4 segundos mientras está abierto', async () => {
    jest.useFakeTimers();
    try {
      compraService.obtenerMensajes
        .mockResolvedValueOnce([mensaje('m1', '¿A qué hora abren?', sofiaAutor)])
        .mockResolvedValue([
          mensaje('m1', '¿A qué hora abren?', sofiaAutor),
          mensaje('m2', 'Abrimos a las 19 hs', ana, true),
        ]);
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await renderAppConSesion();
      await abrirCompra(user, 'CONFIRMADA');
      await user.press(screen.getByText('Mensajes'));
      await screen.findByText('¿A qué hora abren?');
      expect(screen.queryByText('Abrimos a las 19 hs')).toBeNull();

      await act(async () => {
        jest.advanceTimersByTime(4000);
      });

      expect(await screen.findByText('Abrimos a las 19 hs')).toBeTruthy();
      expect(screen.getByText('Ana García · Organizador')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});
