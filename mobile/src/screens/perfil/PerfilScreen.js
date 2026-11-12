import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useFavoritos } from '../../context/FavoritosContext';
import { useCarga } from '../../hooks/useCarga';
import { obtenerFavoritos } from '../../services/eventoService';
import { Boton } from '../../components/Boton';
import { EstadoCarga } from '../../components/EstadoCarga';
import { EventoCard } from '../../components/EventoCard';
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

const Favoritos = styled.View`
  padding: ${({ theme }) => `0px ${theme.espacio.l}px`};
  gap: ${({ theme }) => `${theme.espacio.m}px`};
`;

function MisFavoritos() {
  const navigation = useNavigation();
  const { favoritos } = useFavoritos();
  // Se vuelve a pedir cuando cambia el set de favoritos (marcar/desmarcar en otra pantalla)
  const { datos, cargando, error, recargar } = useCarga(obtenerFavoritos, [favoritos]);

  return (
    <Favoritos>
      <Subtitulo>Mis favoritos</Subtitulo>
      <EstadoCarga
        cargando={cargando && !datos}
        error={error}
        onReintentar={recargar}
        vacio={datos?.length === 0}
        mensajeVacio="Tocá el ♥ de un evento para guardarlo acá."
      >
        {(datos ?? []).map((evento) => (
          <EventoCard
            key={evento.id}
            evento={evento}
            onPress={() => navigation.navigate('DetalleEvento', { eventoId: evento.id })}
          />
        ))}
      </EstadoCarga>
    </Favoritos>
  );
}

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
      <MisFavoritos />
      <Acciones>
        <Boton titulo="Cerrar sesión" variante="secundario" onPress={logout} />
      </Acciones>
    </PantallaScroll>
  );
}
