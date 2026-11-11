import styled from '@emotion/native';

export const Titulo = styled.Text`
  font-size: ${({ theme }) => theme.fuente.titulo}px;
  font-weight: 700;
  color: ${({ theme }) => theme.colores.texto};
`;

export const Subtitulo = styled.Text`
  font-size: ${({ theme }) => theme.fuente.grande}px;
  font-weight: 600;
  color: ${({ theme }) => theme.colores.texto};
`;

export const Texto = styled.Text`
  font-size: ${({ theme }) => theme.fuente.normal}px;
  color: ${({ theme }) => theme.colores.texto};
`;

export const TextoSecundario = styled.Text`
  font-size: ${({ theme }) => theme.fuente.chica}px;
  color: ${({ theme }) => theme.colores.textoSecundario};
`;

export const TextoError = styled.Text`
  font-size: ${({ theme }) => theme.fuente.chica}px;
  color: ${({ theme }) => theme.colores.error};
`;

/** Contenedor de pantalla con scroll para formularios. */
export const PantallaScroll = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colores.fondo};
`;

export const Pantalla = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colores.fondo};
`;
