import styled from '@emotion/native';
import { useAuth } from '../../context/AuthContext';
import { Boton } from '../../components/Boton';
import { RequiereSesion } from '../../components/RequiereSesion';
import { PantallaScroll, Subtitulo, TextoSecundario } from '../../components/Textos';

const Encabezado = styled.View`
  align-items: center;
  padding: ${({ theme }) => `${theme.espacio.xl}px`};
  gap: ${({ theme }) => `${theme.espacio.xs}px`};
`;

const Avatar = styled.View`
  width: 72px;
  height: 72px;
  border-radius: 36px;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => `${theme.espacio.s}px`};
  background-color: ${({ theme }) => theme.colores.primarioSuave};
`;

const Iniciales = styled.Text`
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme.colores.primario};
`;

const Acciones = styled.View`
  padding: ${({ theme }) => `${theme.espacio.xl}px`};
`;

export function PerfilScreen() {
  const { usuario, logout } = useAuth();

  if (!usuario) {
    return (
      <RequiereSesion
        titulo="Tu perfil"
        mensaje="Iniciá sesión para guardar favoritos, comprar entradas y organizar tus eventos."
        icono="account-circle-outline"
      />
    );
  }

  return (
    <PantallaScroll>
      <Encabezado>
        <Avatar>
          <Iniciales>{`${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase()}</Iniciales>
        </Avatar>
        <Subtitulo>{`${usuario.nombre} ${usuario.apellido}`}</Subtitulo>
        <TextoSecundario>{usuario.email}</TextoSecundario>
      </Encabezado>
      <Acciones>
        <Boton titulo="Cerrar sesión" variante="secundario" onPress={logout} />
      </Acciones>
    </PantallaScroll>
  );
}
