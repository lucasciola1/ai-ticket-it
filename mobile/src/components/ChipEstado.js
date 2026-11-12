import styled from '@emotion/native';
import { useTheme } from '@emotion/react';

const Chip = styled.View`
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: ${({ theme }) => `${theme.radio.l}px`};
  background-color: ${({ theme, estado }) => theme.estados[estado].fondo};
`;

const Etiqueta = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.chica}px`};
  font-weight: 600;
  color: ${({ theme, estado }) => theme.estados[estado].texto};
`;

/** Estado de una compra con el color y la etiqueta que define el theme. */
export function ChipEstado({ estado }) {
  const theme = useTheme();
  return (
    <Chip estado={estado}>
      <Etiqueta estado={estado}>{theme.estados[estado].etiqueta}</Etiqueta>
    </Chip>
  );
}
