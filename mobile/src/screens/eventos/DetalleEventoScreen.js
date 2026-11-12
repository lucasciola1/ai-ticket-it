import { ScrollView, useWindowDimensions } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useAuth } from '../../context/AuthContext';
import { useCarga } from '../../hooks/useCarga';
import { useRequiereSesion } from '../../hooks/useRequiereSesion';
import { obtenerEvento, obtenerReseniasDeOrganizador } from '../../services/eventoService';
import { Boton } from '../../components/Boton';
import { BotonFavorito } from '../../components/BotonFavorito';
import { EstadoCarga } from '../../components/EstadoCarga';
import { Estrellas } from '../../components/Estrellas';
import { Pantalla, Subtitulo, Texto, TextoSecundario, Titulo } from '../../components/Textos';
import { formatearFecha, formatearPrecio } from '../../utils/formato';

const Foto = styled.Image`
  aspect-ratio: 1.78;
`;

const Cuerpo = styled.View`
  padding: ${({ theme }) => `${theme.espacio.l}px`};
  gap: ${({ theme }) => `${theme.espacio.m}px`};
`;

const Categoria = styled.Text`
  font-size: ${({ theme }) => `${theme.fuente.chica}px`};
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colores.primario};
`;

const Dato = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Seccion = styled.View`
  gap: ${({ theme }) => `${theme.espacio.s}px`};
  margin-top: ${({ theme }) => `${theme.espacio.s}px`};
`;

const Tarjeta = styled.View`
  padding: ${({ theme }) => `${theme.espacio.m}px`};
  gap: 4px;
  border-radius: ${({ theme }) => `${theme.radio.m}px`};
  background-color: ${({ theme }) => theme.colores.superficie};
  opacity: ${({ apagada }) => (apagada ? 0.55 : 1)};
`;

const FilaEntre = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Negrita = styled(Texto)`
  font-weight: 700;
`;

const BarraCompra = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => `${theme.espacio.m}px`};
  padding: ${({ theme }) => `${theme.espacio.m}px ${theme.espacio.l}px`};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colores.borde};
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const FavoritoSobreFoto = { position: 'absolute', top: 12, right: 12 };
const botonFlexible = { flex: 1 };

/** Texto del botón de compra según el estado del evento. */
const estadoCompra = (evento) => {
  if (evento.esOrganizador) return { puede: false, texto: 'Es tu evento' };
  if (evento.finalizado) return { puede: false, texto: 'Evento finalizado' };
  if (evento.agotado) return { puede: false, texto: 'Agotado' };
  return { puede: true, texto: 'Comprar entradas' };
};

export function DetalleEventoScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const { usuario } = useAuth();
  const conSesion = useRequiereSesion();

  // Se recarga si cambia el usuario (ej. inicia sesión): cambian esOrganizador y esFavorito
  const { datos: evento, cargando, error, recargar } = useCarga(() => obtenerEvento(eventoId), [eventoId, usuario?.id]);
  const organizadorId = evento?.organizador.id;
  const resenias = useCarga(
    () => (organizadorId ? obtenerReseniasDeOrganizador(organizadorId) : Promise.resolve(null)),
    [organizadorId],
  );

  return (
    <EstadoCarga cargando={cargando} error={error} onReintentar={recargar}>
      {evento ? (
        <Pantalla>
          <ScrollView>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {evento.multimedia.map((url) => (
                <Foto key={url} source={{ uri: url }} style={{ width }} resizeMode="cover" />
              ))}
            </ScrollView>
            <BotonFavorito eventoId={evento.id} style={FavoritoSobreFoto} />

            <Cuerpo>
              {evento.categoria ? <Categoria>{evento.categoria.nombre}</Categoria> : null}
              <Titulo>{evento.nombre}</Titulo>
              <Dato>
                <MaterialDesignIcons name="calendar-month-outline" size={20} color={theme.colores.primario} />
                <Texto>{formatearFecha(evento.fecha)}</Texto>
              </Dato>
              <Dato>
                <MaterialDesignIcons name="map-marker-outline" size={20} color={theme.colores.primario} />
                <Texto>{evento.lugar}</Texto>
              </Dato>
              {evento.descripcion ? <TextoSecundario>{evento.descripcion}</TextoSecundario> : null}

              <Seccion>
                <Subtitulo>Entradas</Subtitulo>
                {evento.tiposEntrada.map((tipo) => (
                  <Tarjeta key={tipo.id} apagada={tipo.agotado}>
                    <FilaEntre>
                      <Negrita>{tipo.nombre}</Negrita>
                      <Negrita>{formatearPrecio(tipo.precio)}</Negrita>
                    </FilaEntre>
                    {tipo.descripcion ? <TextoSecundario>{tipo.descripcion}</TextoSecundario> : null}
                    <TextoSecundario>
                      {tipo.agotado ? 'Agotado' : `Quedan ${tipo.disponibles} de ${tipo.cupo}`}
                    </TextoSecundario>
                  </Tarjeta>
                ))}
              </Seccion>

              <Seccion>
                <Subtitulo>Organizador</Subtitulo>
                <Tarjeta>
                  <Negrita>{`${evento.organizador.nombre} ${evento.organizador.apellido}`}</Negrita>
                  {evento.organizador.puntaje !== null ? (
                    <Dato>
                      <Estrellas valor={evento.organizador.puntaje} />
                      <TextoSecundario>
                        {`${evento.organizador.puntaje.toFixed(1)} · ${evento.organizador.cantidadResenias} reseña(s)`}
                      </TextoSecundario>
                    </Dato>
                  ) : (
                    <TextoSecundario>Todavía no tiene reseñas</TextoSecundario>
                  )}
                </Tarjeta>
              </Seccion>

              {resenias.datos?.resenias.length ? (
                <Seccion>
                  <Subtitulo>Lo que dicen de sus eventos anteriores</Subtitulo>
                  {resenias.datos.resenias.map((r) => (
                    <Tarjeta key={r.id}>
                      <FilaEntre>
                        <Estrellas valor={r.puntuacion} tamanio={16} />
                        <TextoSecundario>{r.evento?.nombre}</TextoSecundario>
                      </FilaEntre>
                      {r.detalle ? <Texto>{r.detalle}</Texto> : null}
                      <TextoSecundario>{`${r.comprador?.nombre ?? ''} ${r.comprador?.apellido ?? ''}`}</TextoSecundario>
                    </Tarjeta>
                  ))}
                </Seccion>
              ) : null}
            </Cuerpo>
          </ScrollView>

          <BarraCompra style={{ paddingBottom: Math.max(bottom, 12) }}>
            <TextoSecundario>
              {'Desde\n'}
              <Negrita>{formatearPrecio(evento.precioMinimo)}</Negrita>
            </TextoSecundario>
            <Boton
              style={botonFlexible}
              titulo={estadoCompra(evento).texto}
              deshabilitado={!estadoCompra(evento).puede}
              onPress={conSesion(() => navigation.navigate('Comprar', { eventoId: evento.id }))}
            />
          </BarraCompra>
        </Pantalla>
      ) : null}
    </EstadoCarga>
  );
}
