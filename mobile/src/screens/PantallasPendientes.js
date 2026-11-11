import styled from '@emotion/native';
import { useAuth } from '../context/AuthContext';
import { RequiereSesion } from '../components/RequiereSesion';
import { TextoSecundario } from '../components/Textos';

// Pantallas que se implementan en los próximos pasos (ver docs/arquitectura-frontend.md).

const Centro = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colores.fondo};
`;

const EnConstruccion = () => (
  <Centro>
    <TextoSecundario>En construcción</TextoSecundario>
  </Centro>
);

export const ExplorarScreen = EnConstruccion;

export function MisComprasScreen() {
  const { usuario } = useAuth();
  if (!usuario) {
    return (
      <RequiereSesion
        titulo="Tus compras"
        mensaje="Iniciá sesión para ver tus compras y cuántos días faltan para cada evento."
        icono="ticket-confirmation-outline"
      />
    );
  }
  return <EnConstruccion />;
}

export function MisEventosScreen() {
  const { usuario } = useAuth();
  if (!usuario) {
    return (
      <RequiereSesion
        titulo="Organizá tus eventos"
        mensaje="Iniciá sesión para publicar eventos, definir tipos de entrada y seguir las ventas."
        icono="calendar-star"
      />
    );
  }
  return <EnConstruccion />;
}
