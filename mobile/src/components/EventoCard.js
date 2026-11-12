import { Pressable } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { BotonFavorito } from './BotonFavorito';
import { formatearFecha, formatearPrecio } from '../utils/formato';

const Tarjeta = styled(Pressable)`
  overflow: hidden;
  margin-bottom: ${({ theme }) => `${theme.espacio.l}px`};
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const Imagen = styled.Image`
  width: 100%;
  aspect-ratio: 1.78;
`;

const SinImagen = styled.View`
  width: 100%;
  aspect-ratio: 1.78;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colores.primarioSuave};
`;

const Etiquetas = styled.View`
  position: absolute;
  top: 12px;
  left: 12px;
  flex-direction: row;
  gap: 6px;
`;

const Etiqueta = styled.Text`
  padding: 4px 10px;
  border-radius: 12px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colores.blanco};
  background-color: ${({ theme, alerta }) => (alerta ? theme.colores.error : theme.colores.primario)};
`;

const Cuerpo = styled.View`
  padding: ${({ theme }) => `${theme.espacio.m}px`};
  gap: 4px;
`;

const Nombre = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.grande}px`};
  font-weight: 700;
  color: ${({ theme }) => theme.colores.texto};
`;

const Detalle = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.chica}px`};
  color: ${({ theme }) => theme.colores.textoSecundario};
`;

const Pie = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => `${theme.espacio.xs}px`};
`;

const Precio = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.normal}px`};
  font-weight: 700;
  color: ${({ theme }) => theme.colores.texto};
`;

const Organizador = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const FavoritoArriba = { position: 'absolute', top: 10, right: 10 };

/** Tarjeta de un evento para los listados (Explorar, favoritos, mis eventos). */
export function EventoCard({ evento, onPress, mostrarFavorito = true }) {
  const theme = useTheme();
  const { organizador } = evento;

  return (
    <Tarjeta onPress={onPress} accessibilityRole="button" accessibilityLabel={evento.nombre}>
      {evento.imagen ? (
        <Imagen source={{ uri: evento.imagen }} resizeMode="cover" />
      ) : (
        <SinImagen>
          <MaterialDesignIcons name="ticket-outline" size={48} color={theme.colores.primario} />
        </SinImagen>
      )}
      <Etiquetas>
        {evento.categoria ? <Etiqueta>{evento.categoria.nombre}</Etiqueta> : null}
        {evento.finalizado ? <Etiqueta alerta>Finalizado</Etiqueta> : null}
        {!evento.finalizado && evento.agotado ? <Etiqueta alerta>Agotado</Etiqueta> : null}
      </Etiquetas>
      {mostrarFavorito ? <BotonFavorito eventoId={evento.id} style={FavoritoArriba} /> : null}

      <Cuerpo>
        <Nombre numberOfLines={2}>{evento.nombre}</Nombre>
        <Detalle>{formatearFecha(evento.fecha)}</Detalle>
        <Detalle numberOfLines={1}>{evento.lugar}</Detalle>
        <Pie>
          <Precio>Desde {formatearPrecio(evento.precioMinimo)}</Precio>
          <Organizador>
            <MaterialDesignIcons name="star" size={16} color={theme.colores.estrella} />
            <Detalle>
              {organizador.puntaje !== null ? organizador.puntaje.toFixed(1) : 'Sin reseñas'} ·{' '}
              {organizador.nombre} {organizador.apellido}
            </Detalle>
          </Organizador>
        </Pie>
      </Cuerpo>
    </Tarjeta>
  );
}
