import { useState } from 'react';
import { Alert, Pressable } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useCarga } from '../../hooks/useCarga';
import { useRecargarAlVolver } from '../../hooks/useRecargarAlVolver';
import { cancelarCompra, marcarUtilizada, obtenerCompra, pagarCompra } from '../../services/compraService';
import { mensajeError } from '../../services/api';
import { Boton } from '../../components/Boton';
import { ChipEstado } from '../../components/ChipEstado';
import { EstadoCarga } from '../../components/EstadoCarga';
import { Estrellas } from '../../components/Estrellas';
import { PantallaScroll, Subtitulo, Texto, TextoSecundario, Titulo } from '../../components/Textos';
import { formatearFecha, formatearPrecio, textoDiasFaltantes } from '../../utils/formato';

const Contenido = styled.View`
  padding: ${({ theme }) => `${theme.espacio.l}px`};
  gap: ${({ theme }) => `${theme.espacio.l}px`};
`;

const Tarjeta = styled.View`
  padding: ${({ theme }) => `${theme.espacio.l}px`};
  gap: ${({ theme }) => `${theme.espacio.s}px`};
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const EventoPresionable = styled(Pressable)`
  gap: 4px;
`;

const Fila = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const Cuenta = styled.View`
  align-items: center;
  padding: ${({ theme }) => `${theme.espacio.l}px`};
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  background-color: ${({ theme }) => theme.estados.CONFIRMADA.fondo};
`;

const NumeroDias = styled.Text`
  font-size: 40px;
  font-weight: 800;
  color: ${({ theme }) => theme.estados.CONFIRMADA.texto};
`;

const Acciones = styled.View`
  gap: ${({ theme }) => `${theme.espacio.s}px`};
`;

const Paso = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => `${theme.espacio.m}px`};
`;

const Punto = styled.View`
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: 6px;
  background-color: ${({ theme, estado }) => theme.estados[estado].texto};
`;

const Negrita = styled(Texto)`
  font-weight: 700;
`;

const TextoFlexible = styled(TextoSecundario)`
  flex: 1;
`;

/** Textos de confirmación de cada acción (la regla de reembolso la decide el back). */
const confirmacionCancelar = (compra) =>
  compra.estado === 'CONFIRMADA'
    ? `Se cancela la compra y se te reembolsan ${formatearPrecio(compra.total)}.`
    : 'Se cancela la reserva y se liberan las entradas.';

export function DetalleCompraScreen({ route, navigation }) {
  const { compraId } = route.params;
  const theme = useTheme();
  const { datos: compra, setDatos, cargando, error, recargar, refrescar } = useCarga(
    () => obtenerCompra(compraId),
    [compraId],
  );
  const [accionEnCurso, setAccionEnCurso] = useState(null);
  useRecargarAlVolver(refrescar); // ej. al volver de reseñar o del chat

  /** Pide confirmación, ejecuta la acción en el back y muestra la compra actualizada. */
  const confirmarYEjecutar = (nombre, titulo, mensaje, accion) => {
    Alert.alert(titulo, mensaje, [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          setAccionEnCurso(nombre);
          try {
            setDatos(await accion(compraId));
          } catch (err) {
            Alert.alert('No se pudo completar', mensajeError(err));
            refrescar();
          } finally {
            setAccionEnCurso(null);
          }
        },
      },
    ]);
  };

  return (
    <EstadoCarga cargando={cargando && !compra} error={error} onReintentar={recargar}>
      {compra ? (
        <PantallaScroll>
          <Contenido>
            <EventoPresionable
              onPress={() => navigation.navigate('DetalleEvento', { eventoId: compra.evento.id })}
              accessibilityRole="link"
            >
              <Titulo>{compra.evento.nombre}</Titulo>
              <TextoSecundario>{`${formatearFecha(compra.evento.fecha)} · ${compra.evento.lugar}`}</TextoSecundario>
            </EventoPresionable>

            <Fila>
              <ChipEstado estado={compra.estado} />
              {compra.rol === 'organizador' ? (
                <TextoSecundario>{`Comprador: ${compra.comprador.nombre} ${compra.comprador.apellido}`}</TextoSecundario>
              ) : null}
            </Fila>

            {compra.diasParaEvento !== null ? (
              <Cuenta>
                {compra.diasParaEvento > 1 ? <NumeroDias>{compra.diasParaEvento}</NumeroDias> : null}
                <Negrita>{textoDiasFaltantes(compra.diasParaEvento)}</Negrita>
              </Cuenta>
            ) : null}

            <Tarjeta>
              <Fila>
                <Texto>{`${compra.cantidad} × ${compra.tipoEntrada.nombre}`}</Texto>
                <Texto>{formatearPrecio(compra.precioUnitario)}</Texto>
              </Fila>
              <Fila>
                <Negrita>Total</Negrita>
                <Subtitulo>{formatearPrecio(compra.total)}</Subtitulo>
              </Fila>
              <TextoSecundario>{`Comprada el ${formatearFecha(compra.fechaCompra)}`}</TextoSecundario>
            </Tarjeta>

            <Acciones>
              {compra.acciones.pagar ? (
                <Boton
                  titulo={`Pagar ${formatearPrecio(compra.total)}`}
                  cargando={accionEnCurso === 'pagar'}
                  deshabilitado={Boolean(accionEnCurso)}
                  onPress={() =>
                    confirmarYEjecutar('pagar', 'Confirmar pago', `Vas a pagar ${formatearPrecio(compra.total)}.`, pagarCompra)
                  }
                />
              ) : null}
              {compra.acciones.utilizar ? (
                <Boton
                  titulo="Marcar entrada como utilizada"
                  cargando={accionEnCurso === 'utilizar'}
                  deshabilitado={Boolean(accionEnCurso)}
                  onPress={() =>
                    confirmarYEjecutar(
                      'utilizar',
                      'Validar entrada',
                      'Confirmá que el comprador ingresó al evento.',
                      marcarUtilizada,
                    )
                  }
                />
              ) : null}
              {compra.acciones.reseniar ? (
                <Boton titulo="Calificar el evento" onPress={() => navigation.navigate('Reseniar', { compraId })} />
              ) : null}
              <Boton
                titulo={`Mensajes${compra.cantidadMensajes ? ` (${compra.cantidadMensajes})` : ''}`}
                variante="secundario"
                onPress={() => navigation.navigate('Chat', { compraId, titulo: compra.evento.nombre })}
              />
              {compra.acciones.cancelar ? (
                <Boton
                  titulo="Cancelar compra"
                  variante="peligro"
                  cargando={accionEnCurso === 'cancelar'}
                  deshabilitado={Boolean(accionEnCurso)}
                  onPress={() =>
                    confirmarYEjecutar('cancelar', '¿Cancelar la compra?', confirmacionCancelar(compra), cancelarCompra)
                  }
                />
              ) : null}
            </Acciones>

            {compra.resenia ? (
              <Tarjeta>
                <Subtitulo>Tu reseña</Subtitulo>
                <Estrellas valor={compra.resenia.puntuacion} />
                {compra.resenia.detalle ? <Texto>{compra.resenia.detalle}</Texto> : null}
              </Tarjeta>
            ) : null}

            <Tarjeta>
              <Subtitulo>Historial</Subtitulo>
              {compra.historial.map((cambio) => (
                <Paso key={`${cambio.estado}-${cambio.fechaHora.getTime()}`}>
                  <Punto estado={cambio.estado} />
                  <Texto>
                    <Negrita>{theme.estados[cambio.estado].etiqueta}</Negrita>
                    {'\n'}
                    <TextoSecundario>
                      {`${formatearFecha(cambio.fechaHora)} · ${cambio.quien?.nombre ?? ''} ${cambio.quien?.apellido ?? ''}`}
                    </TextoSecundario>
                  </Texto>
                </Paso>
              ))}
            </Tarjeta>

            {compra.evento.finalizado ? (
              <Fila>
                <MaterialDesignIcons name="information-outline" size={18} color={theme.colores.textoSecundario} />
                <TextoFlexible>El evento ya se realizó.</TextoFlexible>
              </Fila>
            ) : null}
          </Contenido>
        </PantallaScroll>
      ) : null}
    </EstadoCarga>
  );
}
