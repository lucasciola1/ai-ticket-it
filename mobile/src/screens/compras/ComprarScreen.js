import { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useCarga } from '../../hooks/useCarga';
import { obtenerEvento } from '../../services/eventoService';
import { comprar } from '../../services/compraService';
import { mensajeError } from '../../services/api';
import { Boton } from '../../components/Boton';
import { EstadoCarga } from '../../components/EstadoCarga';
import { AvisoError, Formulario } from '../../components/Formulario';
import { PantallaScroll, Subtitulo, Texto, TextoSecundario, Titulo } from '../../components/Textos';
import { formatearFecha, formatearPrecio } from '../../utils/formato';

const MAXIMO_POR_COMPRA = 10; // mismo límite que valida el back

const Opcion = styled(Pressable)`
  padding: ${({ theme }) => `${theme.espacio.m}px`};
  gap: 2px;
  border-width: 2px;
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  border-color: ${({ theme, elegida }) => (elegida ? theme.colores.primario : theme.colores.borde)};
  background-color: ${({ theme }) => theme.colores.superficie};
  opacity: ${({ deshabilitada }) => (deshabilitada ? 0.5 : 1)};
`;

const FilaEntre = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Contador = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => `${theme.espacio.l}px`};
`;

const BotonContador = styled(Pressable)`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colores.primario};
  opacity: ${({ deshabilitado }) => (deshabilitado ? 0.35 : 1)};
`;

const Cantidad = styled.Text`
  min-width: 32px;
  text-align: center;
  font-size: ${({ theme }) => `${theme.fuente.titulo}px`};
  font-weight: 700;
  color: ${({ theme }) => theme.colores.texto};
`;

const Total = styled.View`
  padding: ${({ theme }) => `${theme.espacio.l}px`};
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  background-color: ${({ theme }) => theme.colores.primarioSuave};
`;

const Negrita = styled(Texto)`
  font-weight: 700;
`;

export function ComprarScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const theme = useTheme();
  const { datos: evento, cargando, error, recargar } = useCarga(() => obtenerEvento(eventoId), [eventoId]);
  const [tipoId, setTipoId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [errorCompra, setErrorCompra] = useState(null);

  // Preselecciona el primer tipo con lugar
  useEffect(() => {
    if (evento && !tipoId) {
      setTipoId(evento.tiposEntrada.find((t) => !t.agotado)?.id ?? null);
    }
  }, [evento, tipoId]);

  const tipo = evento?.tiposEntrada.find((t) => t.id === tipoId);
  const maximo = tipo ? Math.min(tipo.disponibles, MAXIMO_POR_COMPRA) : 0;

  const elegirTipo = (t) => {
    setTipoId(t.id);
    setCantidad((c) => Math.max(1, Math.min(c, t.disponibles, MAXIMO_POR_COMPRA)));
  };

  const confirmar = async () => {
    setEnviando(true);
    setErrorCompra(null);
    try {
      const compra = await comprar({ eventoId, tipoEntradaId: tipoId, cantidad });
      Alert.alert(
        '¡Reservaste tus entradas!',
        `Tu compra quedó pendiente de pago por ${formatearPrecio(compra.total)}.`,
      );
      // Reemplaza el modal por el detalle de la compra, donde se puede pagar
      navigation.replace('DetalleCompra', { compraId: compra.id });
    } catch (err) {
      setErrorCompra(mensajeError(err));
      recargar(); // los disponibles pudieron cambiar (ej. otro compró las últimas)
    } finally {
      setEnviando(false);
    }
  };

  return (
    <EstadoCarga cargando={cargando && !evento} error={error} onReintentar={recargar}>
      {evento ? (
        <PantallaScroll>
          <Formulario>
            <Titulo>{evento.nombre}</Titulo>
            <TextoSecundario>{`${formatearFecha(evento.fecha)} · ${evento.lugar}`}</TextoSecundario>
            <AvisoError mensaje={errorCompra} />

            <Subtitulo>Tipo de entrada</Subtitulo>
            {evento.tiposEntrada.map((t) => (
              <Opcion
                key={t.id}
                elegida={t.id === tipoId}
                deshabilitada={t.agotado}
                disabled={t.agotado}
                onPress={() => elegirTipo(t)}
                accessibilityRole="radio"
                accessibilityState={{ checked: t.id === tipoId, disabled: t.agotado }}
              >
                <FilaEntre>
                  <Negrita>{t.nombre}</Negrita>
                  <Negrita>{formatearPrecio(t.precio)}</Negrita>
                </FilaEntre>
                <TextoSecundario>{t.agotado ? 'Agotado' : `Quedan ${t.disponibles}`}</TextoSecundario>
              </Opcion>
            ))}

            {tipo ? (
              <>
                <Subtitulo>Cantidad</Subtitulo>
                <FilaEntre>
                  <Contador>
                    <BotonContador
                      onPress={() => setCantidad((c) => c - 1)}
                      disabled={cantidad <= 1}
                      deshabilitado={cantidad <= 1}
                      accessibilityLabel="Restar una entrada"
                    >
                      <MaterialDesignIcons name="minus" size={22} color={theme.colores.primario} />
                    </BotonContador>
                    <Cantidad accessibilityLabel="Cantidad">{cantidad}</Cantidad>
                    <BotonContador
                      onPress={() => setCantidad((c) => c + 1)}
                      disabled={cantidad >= maximo}
                      deshabilitado={cantidad >= maximo}
                      accessibilityLabel="Sumar una entrada"
                    >
                      <MaterialDesignIcons name="plus" size={22} color={theme.colores.primario} />
                    </BotonContador>
                  </Contador>
                  <TextoSecundario>{`Máximo ${maximo}`}</TextoSecundario>
                </FilaEntre>

                <Total>
                  <FilaEntre>
                    <Texto>{`${cantidad} × ${formatearPrecio(tipo.precio)}`}</Texto>
                    <Subtitulo>{formatearPrecio(cantidad * tipo.precio)}</Subtitulo>
                  </FilaEntre>
                </Total>

                <Boton titulo="Confirmar compra" onPress={confirmar} cargando={enviando} />
                <TextoSecundario>
                  La compra queda pendiente de pago: la podés pagar o cancelar desde su detalle.
                </TextoSecundario>
              </>
            ) : (
              <TextoSecundario>No quedan entradas disponibles.</TextoSecundario>
            )}
          </Formulario>
        </PantallaScroll>
      ) : null}
    </EstadoCarga>
  );
}
