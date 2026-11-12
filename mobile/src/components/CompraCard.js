import { Pressable } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { ChipEstado } from './ChipEstado';
import { formatearFecha, formatearPrecio, textoDiasFaltantes } from '../utils/formato';

const Tarjeta = styled(Pressable)`
  flex-direction: row;
  gap: ${({ theme }) => `${theme.espacio.m}px`};
  padding: ${({ theme }) => `${theme.espacio.m}px`};
  margin-bottom: ${({ theme }) => `${theme.espacio.m}px`};
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const Miniatura = styled.Image`
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => `${theme.radio.s}px`};
`;

const SinImagen = styled.View`
  width: 72px;
  height: 72px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => `${theme.radio.s}px`};
  background-color: ${({ theme }) => theme.colores.primarioSuave};
`;

const Info = styled.View`
  flex: 1;
  gap: 4px;
`;

const Nombre = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.normal}px`};
  font-weight: 700;
  color: ${({ theme }) => theme.colores.texto};
`;

const Detalle = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.chica}px`};
  color: ${({ theme }) => theme.colores.textoSecundario};
`;

const Fila = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Destacado = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.chica}px`};
  font-weight: 700;
  color: ${({ theme, color }) => color ?? theme.colores.primario};
`;

/** Llamado a la acción según lo que se puede hacer con la compra. */
const pendiente = (compra, theme) => {
  if (compra.acciones.pagar) return { texto: 'Falta pagar', color: theme.estados.PENDIENTE.texto };
  if (compra.acciones.reseniar) return { texto: '¡Contanos qué te pareció!', color: theme.colores.primario };
  if (compra.acciones.utilizar) return { texto: 'Validar entrada', color: theme.colores.primario };
  return null;
};

/**
 * Compra en un listado. `mostrarComprador` es para la vista del organizador.
 * Si está confirmada, muestra cuántos días faltan para el evento.
 */
export function CompraCard({ compra, onPress, mostrarComprador = false }) {
  const theme = useTheme();
  const aviso = pendiente(compra, theme);

  return (
    <Tarjeta onPress={onPress} accessibilityRole="button" accessibilityLabel={`Compra de ${compra.evento.nombre}`}>
      {compra.evento.imagen ? (
        <Miniatura source={{ uri: compra.evento.imagen }} />
      ) : (
        <SinImagen>
          <MaterialDesignIcons name="ticket-outline" size={28} color={theme.colores.primario} />
        </SinImagen>
      )}
      <Info>
        <Nombre numberOfLines={1}>
          {mostrarComprador ? `${compra.comprador.nombre} ${compra.comprador.apellido}` : compra.evento.nombre}
        </Nombre>
        <Detalle>
          {mostrarComprador
            ? `Compró el ${formatearFecha(compra.fechaCompra)}`
            : formatearFecha(compra.evento.fecha)}
        </Detalle>
        <Detalle>{`${compra.cantidad} × ${compra.tipoEntrada.nombre} · ${formatearPrecio(compra.total)}`}</Detalle>
        <Fila>
          <ChipEstado estado={compra.estado} />
          {compra.diasParaEvento !== null ? (
            <Destacado>{textoDiasFaltantes(compra.diasParaEvento)}</Destacado>
          ) : aviso ? (
            <Destacado color={aviso.color}>{aviso.texto}</Destacado>
          ) : null}
        </Fila>
      </Info>
    </Tarjeta>
  );
}
