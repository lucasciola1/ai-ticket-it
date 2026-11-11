import styled from '@emotion/native';

/** Contenido de una pantalla de formulario (va dentro de PantallaScroll). */
export const Formulario = styled.View`
  padding: ${({ theme }) => theme.espacio.xl}px;
  gap: ${({ theme }) => theme.espacio.s}px;
`;

const Caja = styled.View`
  padding: ${({ theme }) => theme.espacio.m}px;
  margin-bottom: ${({ theme }) => theme.espacio.l}px;
  border-radius: ${({ theme }) => theme.radio.m}px;
  background-color: ${({ theme }) => theme.colores.errorSuave};
`;

const TextoAviso = styled.Text`
  font-size: ${({ theme }) => theme.fuente.chica}px;
  color: ${({ theme }) => theme.colores.error};
`;

/** Mensaje de error general de un formulario (el `mensaje` que mandó el back). */
export function AvisoError({ mensaje }) {
  if (!mensaje) return null;
  return (
    <Caja accessibilityRole="alert">
      <TextoAviso>{mensaje}</TextoAviso>
    </Caja>
  );
}

export const Enlace = styled.Text`
  font-size: ${({ theme }) => theme.fuente.normal}px;
  font-weight: 600;
  text-align: center;
  padding: ${({ theme }) => theme.espacio.m}px;
  color: ${({ theme }) => theme.colores.primario};
`;
