import { ActivityIndicator } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { Boton } from './Boton';
import { Texto, TextoSecundario } from './Textos';

const Centro = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.espacio.xl}px;
  gap: ${({ theme }) => theme.espacio.l}px;
`;

const MensajeError = styled(Texto)`
  text-align: center;
  color: ${({ theme }) => theme.colores.error};
`;

/**
 * Renderiza el estado de una carga con early returns:
 * spinner → error con "Reintentar" → vacío → contenido.
 */
export function EstadoCarga({ cargando, error, onReintentar, vacio = false, mensajeVacio, children }) {
  const theme = useTheme();

  if (cargando) {
    return (
      <Centro>
        <ActivityIndicator size="large" color={theme.colores.primario} />
      </Centro>
    );
  }
  if (error) {
    return (
      <Centro>
        <MensajeError>{error}</MensajeError>
        {onReintentar ? <Boton titulo="Reintentar" variante="secundario" onPress={onReintentar} /> : null}
      </Centro>
    );
  }
  if (vacio) {
    return (
      <Centro>
        <TextoSecundario>{mensajeVacio}</TextoSecundario>
      </Centro>
    );
  }
  return children;
}
