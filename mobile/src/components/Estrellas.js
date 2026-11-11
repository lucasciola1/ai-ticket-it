import { Pressable } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';

const Fila = styled.View`
  flex-direction: row;
  align-items: center;
`;

/**
 * Muestra un puntaje de 1 a 5 (admite medios, ej. 4.5).
 * Si recibe onCambiar, las estrellas se pueden tocar para elegir el puntaje.
 */
export function Estrellas({ valor = 0, onCambiar, tamanio = 18 }) {
  const theme = useTheme();
  return (
    <Fila>
      {[1, 2, 3, 4, 5].map((n) => {
        const icono = valor >= n ? 'star' : valor >= n - 0.5 ? 'star-half-full' : 'star-outline';
        const estrella = <MaterialDesignIcons name={icono} size={tamanio} color={theme.colores.estrella} />;
        return onCambiar ? (
          <Pressable key={n} onPress={() => onCambiar(n)} hitSlop={6} accessibilityLabel={`${n} estrellas`}>
            {estrella}
          </Pressable>
        ) : (
          <Fila key={n}>{estrella}</Fila>
        );
      })}
    </Fila>
  );
}
