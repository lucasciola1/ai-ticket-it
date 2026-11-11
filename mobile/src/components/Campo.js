import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { TextoError } from './Textos';

const Contenedor = styled.View`
  margin-bottom: ${({ theme }) => theme.espacio.l}px;
`;

const Etiqueta = styled.Text`
  font-size: ${({ theme }) => theme.fuente.chica}px;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.espacio.xs}px;
  color: ${({ theme }) => theme.colores.texto};
`;

const Input = styled.TextInput`
  min-height: 48px;
  padding: 10px 14px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radio.m}px;
  border-color: ${({ theme, conError }) => (conError ? theme.colores.error : theme.colores.borde)};
  background-color: ${({ theme }) => theme.colores.superficie};
  font-size: ${({ theme }) => theme.fuente.normal}px;
  color: ${({ theme }) => theme.colores.texto};
`;

/** Input controlado con etiqueta y el error que mandó el back para ese campo. */
export function Campo({ etiqueta, error, ...props }) {
  const theme = useTheme();
  return (
    <Contenedor>
      <Etiqueta>{etiqueta}</Etiqueta>
      <Input
        conError={Boolean(error)}
        placeholderTextColor={theme.colores.textoSecundario}
        accessibilityLabel={etiqueta}
        {...props}
      />
      {error ? <TextoError>{error}</TextoError> : null}
    </Contenedor>
  );
}
