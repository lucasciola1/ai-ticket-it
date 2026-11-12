import { Pressable } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';

const Contenedor = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-width: 1px;
  border-radius: ${({ theme }) => `${theme.radio.l}px`};
  border-color: ${({ theme, seleccionado }) => (seleccionado ? theme.colores.primario : theme.colores.borde)};
  background-color: ${({ theme, seleccionado }) =>
    seleccionado ? theme.colores.primarioSuave : theme.colores.superficie};
`;

const Etiqueta = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.chica}px`};
  font-weight: 600;
  color: ${({ theme, seleccionado }) => (seleccionado ? theme.colores.primario : theme.colores.texto)};
`;

/** Chip seleccionable para filtros y orden. */
export function Chip({ etiqueta, seleccionado = false, onPress, icono }) {
  const theme = useTheme();
  return (
    <Contenedor
      seleccionado={seleccionado}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: seleccionado }}
    >
      <Etiqueta seleccionado={seleccionado}>{etiqueta}</Etiqueta>
      {icono ? (
        <MaterialDesignIcons
          name={icono}
          size={14}
          color={seleccionado ? theme.colores.primario : theme.colores.texto}
        />
      ) : null}
    </Contenedor>
  );
}
