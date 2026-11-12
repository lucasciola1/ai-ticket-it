import { FlatList, RefreshControl } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { useAuth } from '../../context/AuthContext';
import { useCarga } from '../../hooks/useCarga';
import { useRecargarAlVolver } from '../../hooks/useRecargarAlVolver';
import { obtenerMisEventos } from '../../services/eventoService';
import { Boton } from '../../components/Boton';
import { EstadoCarga } from '../../components/EstadoCarga';
import { EventoCard } from '../../components/EventoCard';
import { RequiereSesion } from '../../components/RequiereSesion';
import { Pantalla, TextoSecundario } from '../../components/Textos';

const Encabezado = styled.View`
  gap: ${({ theme }) => `${theme.espacio.s}px`};
  margin-bottom: ${({ theme }) => `${theme.espacio.l}px`};
`;

const listaContenido = { padding: 16, flexGrow: 1 };

function ListaDeEventos({ navigation }) {
  const theme = useTheme();
  const { datos, cargando, refrescando, error, recargar, refrescar } = useCarga(obtenerMisEventos, []);
  useRecargarAlVolver(refrescar); // ej. al volver de crear un evento

  const crear = () => navigation.navigate('CrearEvento');

  return (
    <Pantalla>
      <EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
        <FlatList
          data={datos ?? []}
          keyExtractor={(e) => e.id}
          contentContainerStyle={listaContenido}
          ListHeaderComponent={
            <Encabezado>
              <Boton titulo="Crear evento" onPress={crear} />
              {datos?.length ? <TextoSecundario>Tocá un evento para ver sus ventas.</TextoSecundario> : null}
            </Encabezado>
          }
          ListEmptyComponent={
            <TextoSecundario>Todavía no publicaste eventos. Creá el primero con sus tipos de entrada.</TextoSecundario>
          }
          renderItem={({ item }) => (
            <EventoCard
              evento={item}
              mostrarFavorito={false}
              onPress={() => navigation.navigate('ComprasDelEvento', { eventoId: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[theme.colores.primario]} />
          }
        />
      </EstadoCarga>
    </Pantalla>
  );
}

export function MisEventosScreen({ navigation }) {
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
  return <ListaDeEventos key={usuario.id} navigation={navigation} />;
}
