import { Alert, Pressable } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useFavoritos } from '../context/FavoritosContext';
import { useRequiereSesion } from '../hooks/useRequiereSesion';
import { mensajeError } from '../services/api';

const Circulo = styled(Pressable)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colores.superficie};
`;

/** ♥ que marca o desmarca un favorito (pide sesión si no hay). */
export function BotonFavorito({ eventoId, style }) {
  const theme = useTheme();
  const { esFavorito, alternarFavorito } = useFavoritos();
  const conSesion = useRequiereSesion();
  const activo = esFavorito(eventoId);

  const alternar = conSesion(async () => {
    try {
      await alternarFavorito(eventoId);
    } catch (error) {
      Alert.alert('No pudimos guardar el favorito', mensajeError(error));
    }
  });

  return (
    <Circulo
      onPress={alternar}
      style={style}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <MaterialDesignIcons
        name={activo ? 'heart' : 'heart-outline'}
        size={22}
        color={activo ? theme.colores.error : theme.colores.texto}
      />
    </Circulo>
  );
}
