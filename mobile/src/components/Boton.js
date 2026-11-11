import { ActivityIndicator, Pressable } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';

const Contenedor = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 20px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radio.m}px;
  border-color: ${({ theme, variante }) => theme.botones[variante].borde};
  background-color: ${({ theme, variante }) => theme.botones[variante].fondo};
  opacity: ${({ inactivo }) => (inactivo ? 0.5 : 1)};
`;

const Etiqueta = styled.Text`
  font-size: ${({ theme }) => theme.fuente.normal}px;
  font-weight: 600;
  color: ${({ theme, variante }) => theme.botones[variante].texto};
`;

/**
 * @param variante 'primario' | 'secundario' | 'peligro'
 * @param cargando muestra un spinner y bloquea el botón (evita envíos duplicados)
 */
export function Boton({ titulo, onPress, variante = 'primario', cargando = false, deshabilitado = false, style }) {
  const theme = useTheme();
  const inactivo = cargando || deshabilitado;
  return (
    <Contenedor
      onPress={onPress}
      disabled={inactivo}
      variante={variante}
      inactivo={inactivo}
      style={style}
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(0,0,0,0.12)' }}
    >
      {cargando ? (
        <ActivityIndicator color={theme.botones[variante].texto} />
      ) : (
        <Etiqueta variante={variante}>{titulo}</Etiqueta>
      )}
    </Contenedor>
  );
}
